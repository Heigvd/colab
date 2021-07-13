/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.microchanges.live;

import ch.colabproject.colab.api.ejb.TransactionManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.microchanges.model.Change;
import ch.colabproject.colab.api.microchanges.tools.CancelDebounce;
import ch.colabproject.colab.api.microchanges.tools.Debouncer;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.persistence.document.BlockDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import com.hazelcast.cluster.Member;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.core.IExecutorService;
import com.hazelcast.cp.lock.FencedLock;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import javax.cache.Cache;
import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Singleton;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    /** Shared cache of microchanges */
    @Inject
    private Cache<Long, LiveUpdates> cache;

    /** Block DAO */
    @Inject
    private BlockDao blockDao;

    /** Hazelcast instance. */
    @Inject
    private HazelcastInstance hzInstance;

    /**
     * To register changes as updated object
     */
    @Inject
    private TransactionManager transactionManager;

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
     * Get pendings updates for the given block
     *
     * @param id of the block
     *
     * @return LiveUpdate object
     */
    private LiveUpdates get(Long id) {
        logger.debug("Get LiveUpdates for block #{}", id);
        try {
            this.lock(id);
            LiveUpdates get = cache.get(id);
            if (get != null) {
                logger.trace("Get existing {}", get);
                return get;
            } else {
                LiveUpdates l = new LiveUpdates();

                Block block = blockDao.findBlock(id);
                if (block instanceof TextDataBlock) {
                    TextDataBlock txtBlock = (TextDataBlock) block;
                    l.setRevision(txtBlock.getRevision());
                    l.setContent(txtBlock.getTextData());

                    //l.setRevision(txtBlock.getRevision());
                    l.setTargetClass(block.getJsonDiscriminator());
                    l.setTargetId(block.getId());
                }

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
        Block aBlock = blockDao.findBlock(id);
        if (aBlock instanceof TextDataBlock) {
            TextDataBlock block = (TextDataBlock) aBlock;
            try {
                this.lock(id);
                LiveUpdates get = get(id);
                List<Change> changes = get.getPendingChanges();

                String basedOn = patch.getBasedOn();

                boolean parentExists = block.getRevision().equals(basedOn)
                    || changes.stream()
                        .filter(change -> change.getRevision().equals(basedOn))
                        .findFirst().isPresent();

                if (!parentExists) {
                    logger.trace("Change is based on non-existing parent");
                    logger.trace("TODO: keep it in a temp bag the time his parent is known");
                    //patch.setBasedOn("0");
                }
                Project project = block.getProject();

                if (project != null) {
                    patch.setProjectId(project.getId());
                } else {
                    throw HttpErrorMessage.relatedObjectNotFoundError();
                }

                changes.add(patch);
                cache.put(id, get);
                this.scheduleSaveMicroChanges(id);

                logger.trace("Registered change is {}", patch);
                transactionManager.registerUpdate(patch);
//                WsUpdateChangeMessage message = WsUpdateChangeMessage.build(List.of(patch));

//                try {
//                    PrecomputedWsMessages msg = WebsocketHelper.prepareWsMessage(userDao, block.getChannels(), message);
//                    websocketFacade.propagate(msg);
//                } catch (EncodeException ex) {
//                    logger.error("Live update error: precompute failed");
//                }
            } finally {
                this.unlock(id);
            }
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
        LiveUpdates get = cache.get(id);
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
        logger.debug("Process changes for #{}", blockId);
        try {
            this.lock(blockId);
            Block block = blockDao.findBlock(blockId);
            if (block instanceof TextDataBlock) {
                TextDataBlock txtBlock = (TextDataBlock) block;
                LiveUpdates get = this.cache.get(blockId);
                if (get != null) {
                    try {
                        LiveResult result = get.process(false);
                        txtBlock.setTextData(result.getContent());
                        txtBlock.setRevision(result.getRevision());

                        blockDao.updateBlock(block);
                        this.deletePendingChangesAndPropagate(blockId);
                    } catch (RuntimeException ex) {
                        logger.error("Process failed", ex);
                        throw ex;
                    } catch (ColabMergeException ex) {
                        logger.error("Fails to save block", ex);
                    }
                }
            }
        } finally {
            this.unlock(blockId);
        }
    }

    /**
     * Clear pending changes
     *
     * @param id id of the block
     */
    public void deletePendingChangesAndPropagate(Long id) {
        logger.debug("Delete pending changes");
        Block block = blockDao.findBlock(id);
        if (block != null) {
            List<Change> changes = getPendingChanges(id);
            cache.remove(id);

            transactionManager.registerDeletion(changes);
//            WsDeleteChangeMessage message = WsDeleteChangeMessage.build(changes);
//
//            try {
//                PrecomputedWsMessages msg = WebsocketHelper.prepareWsMessage(userDao, block.getChannels(), message);
//                websocketFacade.propagate(msg);
//            } catch (EncodeException ex) {
//                logger.error("Live update error: precompute failed");
//            }
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
        Map<Member, Future<Boolean>> cancelCalls = executorService.submitToAllMembers(new CancelDebounce(blockId));

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
}
