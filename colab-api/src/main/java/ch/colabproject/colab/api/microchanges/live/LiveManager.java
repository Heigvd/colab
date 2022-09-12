/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.microchanges.live;

import ch.colabproject.colab.api.controller.EntityGatheringBagForPropagation;
import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.document.BlockManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.microchanges.live.monitoring.BlockMonitoring;
import ch.colabproject.colab.api.microchanges.model.Change;
import ch.colabproject.colab.api.microchanges.tools.CancelDebounce;
import ch.colabproject.colab.api.microchanges.tools.Debouncer;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.card.CardTypeRef;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.Resourceable;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.project.Project;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Singleton;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.hazelcast.cluster.Member;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.core.IExecutorService;
import com.hazelcast.cp.lock.FencedLock;
import com.hazelcast.map.IMap;
import java.util.stream.Collectors;

/**
 * Micro Changes Management.
 *
 * @author maxence
 */
@Singleton
@Lock(LockType.READ)
public class LiveManager implements Serializable {

    private static final long serialVersionUID = 1L;

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(LiveManager.class);

    /** delayed process call */
    private final Map<Long, Future<Void>> debounces = new HashMap<>();

    /** Block specific logic management */
    @Inject
    private BlockManager blockManager;

    /** Hazelcast instance. */
    @Inject
    private HazelcastInstance hzInstance;

    /** The request manager */
    @Inject
    private RequestManager requestManager;

    /**
     * To register changes as updated object
     */
    @Inject
    private EntityGatheringBagForPropagation transactionManager;

    /** Get shared cache of microchanges */
    private IMap<Long, LiveUpdates> getCache() {
        return hzInstance.getMap("MICROCHANGES_CAHCE");
    }

    /**
     * Get the lock for the given block id
     *
     * @param id id of the block
     *
     * @return the lock
     */
    private FencedLock getLock(Long id) {
        return hzInstance.getCPSubsystem().getLock("Block" + id);
    }

    /**
     * Lock the block
     *
     * @param id id of the block to lock
     */
    private void lock(Long id) {
        logger.trace("Lock block #{}", id);
        getLock(id).lock();
    }

    /**
     * Unlock the block
     *
     * @param id id of the block to unlock
     */
    private void unlock(Long id) {
        logger.trace("Unlock block #{}", id);
        getLock(id).unlock();
    }

    /**
     * Get pending updates for the given block
     *
     * @param id of the block
     *
     * @return LiveUpdate object
     */
    private LiveUpdates get(Long id) {
        logger.debug("Get LiveUpdates for block #{}", id);
        try {
            this.lock(id);
            LiveUpdates get = getCache().get(id);
            if (get != null) {
                logger.trace("Get existing {}", get);
                return get;
            } else {
                LiveUpdates l = new LiveUpdates();

                TextDataBlock block = blockManager.findBlock(id);
                l.setRevision(block.getRevision());
                l.setContent(block.getTextData());

                l.setTargetClass(block.getJsonDiscriminator());
                l.setTargetId(block.getId());

                logger.trace("new empty LiveUpdates  {}", l);
                return l;
            }
        } finally {
            this.unlock(id);
        }
    }

    /**
     * Patch a block. Add the given changes to the list of pending changes and schedule changes
     * processing.
     *
     * @param id    id of the block to patch
     * @param patch the patch to apply
     */
    public void patchBlock(Long id, Change patch) {
        logger.debug("Patch block #{} with {}", id, patch);
        TextDataBlock block = blockManager.findBlock(id);
        try {
            this.lock(id);
            LiveUpdates get = get(id);
            List<Change> changes = get.getPendingChanges();

            Set<String> basedOn = patch.getBasedOn();

            boolean parentExists = basedOn.contains(block.getRevision())
                || changes.stream()
                    .filter(change -> basedOn.stream()
                    .filter(rev -> change.getRevision().equals(rev))
                    .findFirst().isPresent()
                    )
                    .findFirst().isPresent();

            if (!parentExists) {
                logger.warn("Change is based on non-existing parent");
                logger.trace("TODO: keep it in a temp bag the time his parent is known");
                // patch.setBasedOn("0");
            }
            // Project project = block.getProject();

            patch.setBlockId(block.getId());

            changes.add(patch);
            getCache().put(id, get);
            this.scheduleSaveMicroChanges(id);

            logger.trace("Registered change is {}", patch);
            transactionManager.registerUpdate(patch);
//            WsUpdateChangeMessage message = WsUpdateChangeMessage.build(List.of(patch));

//            try {
//                PrecomputedWsMessages msg = WebsocketHelper.prepareWsMessage(userDao,
//                    block.getChannels(), message);
//                websocketManager.propagate(msg);
//            } catch (EncodeException ex) {
//                logger.error("Live update error: precompute failed");
//            }
        } finally {
            this.unlock(id);
        }
    }

    /**
     * Get all pending changes for the given block
     *
     * @param id id of the block
     *
     * @return list of changes
     */
    public List<Change> getPendingChanges(Long id) {
        LiveUpdates get = getCache().get(id);
        if (get != null) {
            return get.getPendingChanges();
        } else {
            return new ArrayList<>();
        }
    }

    /**
     * Process all pending changes and save new value to database.
     *
     * @param blockId id of the block to process
     */
    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public void process(Long blockId) {
        requestManager.sudo(() -> {
            logger.debug("Process changes for #{}", blockId);
            try {
                this.lock(blockId);
                TextDataBlock block = blockManager.findBlock(blockId);
                if (block != null) {
                    LiveUpdates get = this.getCache().get(blockId);
                    if (get != null) {
                        try {
                            LiveResult result = get.process(false);
                            block.setTextData(result.getContent());
                            block.setRevision(result.getRevision());

                            blockManager.updateBlock(block);
                            this.deletePendingChangesAndPropagate(blockId);
                        } catch (RuntimeException ex) {
                            logger.error("Process failed", ex);
                            block.setHealthy(false);
                        } catch (ColabMergeException ex) {
                            logger.error("Fails to save block", ex);
                            block.setHealthy(false);
                        } catch (StackOverflowError error) {
                            logger.error("StackOverflowError");
                            block.setHealthy(false);
                        }
                    }
                } else {
                    // block has been deleted
                    this.deletePendingChangesAndPropagate(blockId);
                }
            } finally {
                this.unlock(blockId);
            }
        }
        );
    }

    /**
     * Clear pending changes
     *
     * @param id id of the block
     */
    public void deletePendingChangesAndPropagate(Long id) {
        logger.debug("Delete pending changes");
        TextDataBlock block = blockManager.findBlock(id);
        if (block != null) {

            block.setHealthy(true);
            try {
                List<Change> changes = getPendingChanges(id);
                transactionManager.registerDeletion(changes);
            } catch (Throwable t) {
                logger.warn("Propagate deleted changes failed", t);
            }
//            WsDeleteChangeMessage message = WsDeleteChangeMessage.build(changes);
//
//            try {
//                PrecomputedWsMessages msg = WebsocketHelper.prepareWsMessage(userDao, block.getChannels(), message);
//                websocketManager.propagate(msg);
//            } catch (EncodeException ex) {
//                logger.error("Live update error: precompute failed");
//            }
        }

        try {
            getCache().remove(id);
        } catch (Throwable t) {
            logger.warn("Drop changes", t);
        }
    }

    /**
     * Cancel any debounce call related to the given blockId
     *
     * @param blockId id of the block
     *
     * @return true if there was something to cancel
     */
    public boolean cancelDebounce(Long blockId) {
        logger.debug("Cancel debounce #{}", blockId);
        Future<Void> remove = this.debounces.remove(blockId);
        if (remove != null) {
            return remove.cancel(true);
        }
        return false;
    }

    /**
     * Schedule changes processing.
     * <p>
     * Ask all hazelcast instances to cancel any pending process call and reschedule a new one
     *
     * @param blockId id of the block
     */
    public void scheduleSaveMicroChanges(Long blockId) {
        IExecutorService executorService = hzInstance.getExecutorService("COLAB_LIVE");
        Map<Member, Future<Boolean>> cancelCalls = executorService
            .submitToAllMembers(new CancelDebounce(blockId));

        logger.debug("Schedule processing #{}", blockId);

        // cancel all pending debounce calls
        cancelCalls.values().forEach(cancelCall -> {
            try {
                cancelCall.get();
            } catch (InterruptedException | ExecutionException ex) {
                logger.error("Fails to cancel", ex);
            }
        });

        // schedule a new one
        Future<Void> call = executorService.submit(new Debouncer(blockId));
        this.debounces.put(blockId, call);
    }

    /**
     * get data to monitor block with pending changes
     *
     * @return monitoring data
     */
    public List<BlockMonitoring> getMonitoringData() {
        IMap<Long, LiveUpdates> cache = getCache();
        Set<Long> keys = cache.keySet();

        return keys.stream().map(key -> {
            var bm = new BlockMonitoring();
            bm.setBlockId(key);
            TextDataBlock block = blockManager.findBlock(key);

            if (block != null) {
                StringBuilder title = new StringBuilder();
                if (block.getProject() != null) {
                    Project p = block.getProject();
                    title.append("Project \"")
                        .append(p.getName())
                        .append("\" #")
                        .append(p.getId())
                        .append(" / ");
                }
                try {
                    if (block.getOwningResource() != null) {
                        // block belongs to a resource
                        Resource r = block.getOwningResource();
                        Resourceable owner = r.getOwner();
                        if (owner instanceof CardType) {
                            CardType ct = (CardType) owner;
                            title.append("Type: ").append(ct.getTitle()).append(" #").append(ct.getId());
                        } else if (owner instanceof CardTypeRef) {
                            CardTypeRef ref = (CardTypeRef) owner;
                            title.append("TypeRef: ").append(ref.resolve().getTitle()).append(" #").append(ref.getId());
                        } else if (owner instanceof CardContent) {
                            CardContent cc = (CardContent) owner;
                            Card c = cc.getCard();
                            title.append("Card: ").append(c.getTitle()).append(" #").append(c.getId());
                            title.append(" / CardContent: ").append(cc.getTitle()).append(" #").append(cc.getId());
                        } else if (owner instanceof Card) {
                            Card c = (Card) owner;
                            title.append("Card: ").append(c.getTitle()).append(" #").append(c.getId());
                        }

                        title.append(" / Resource ").append(r.getTitle()).append(" # ").append(r.getId());
                    } else if (block.getOwningCardContent() != null) {
                        CardContent cc = block.getOwningCardContent();
                        Card c = cc.getCard();
                        title.append("Card: ").append(c.getTitle()).append(" #").append(c.getId()
                        ).append(" / CardContent: ").append(cc.getTitle()).append(" #").append(cc.getId());
                    }
                } catch (Throwable error) {
                    /** no-op */
                    logger.warn("Fails to build block title {}", block);
                }
                bm.setTitle(title.toString());
                try {
                    var data = cache.get(key);
                    if (data != null) {
                        if (block.isHealthy()) {
                            bm.setStatus(BlockMonitoring.BlockStatus.HEALTHY);
                        } else {
                            bm.setStatus(BlockMonitoring.BlockStatus.UNHEALTHY);
                        }
                    } else {
                        bm.setStatus(BlockMonitoring.BlockStatus.PROCESSED);
                    }
                } catch (Throwable e) {
                    /** Catch everything ! */
                    bm.setStatus(BlockMonitoring.BlockStatus.DATA_ERROR);
                }
            } else {
                bm.setTitle("Ghost block");
                bm.setStatus(BlockMonitoring.BlockStatus.DELETED);
            }

            return bm;
        }).collect(Collectors.toList());
    }
}
