/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller;

import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.persistence.jpa.card.CardTypeDao;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import ch.colabproject.colab.api.ws.WebsocketMessagePreparer;
import ch.colabproject.colab.api.ws.message.IndexEntry;
import ch.colabproject.colab.api.ws.message.PrecomputedWsMessages;
import java.io.Serializable;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.transaction.Status;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Transaction sidekick used to collect updated and deleted entities. Once the transaction is
 * completed, precompute messages to propagate through websocket channels.
 *
 * @author maxence
 */
@RequestScoped
//@Stateful
public class EntityGatheringBagForPropagation implements Serializable {

    private static final long serialVersionUID = 1L;

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(EntityGatheringBagForPropagation.class);

    /**
     * Synchronizer
     */
    private transient WebsocketTxSync synchronizer;

    /**
     * To send message to clients
     */
    @Inject
    private WebsocketManager websocketManager;

    /**
     * To resolve meta channels
     */
    @Inject
    private UserDao userDao;

    /**
     * To resolve meta channels
     */
    @Inject
    private CardTypeDao cardTypeDao;

    /**
     * TO sudo
     */
    @Inject
    private RequestManager requestManager;

    /**
     * To sync with JTA transaction(s)
     */
    @Inject
    private WebsocketTxManager txManager;

    /**
     * set of updated entities to be propagated
     */
    private Set<WithWebsocketChannels> updated = new HashSet<>();

    /**
     * set of entities which have been deleted during the transaction
     */
    private Set<IndexEntry> deleted = new HashSet<>();

    /**
     * store the prepared messages
     */
    private PrecomputedWsMessages message;

    /**
     * Is the message has been precomputed ?
     */
    private boolean precomputed = false;

    /**
     * Get the synchronizer
     *
     * @return the synchronizer
     */
    public WebsocketTxSync getSynchronizer() {
        return synchronizer;
    }

    /**
     * Set the synchronizer
     *
     * @param sync the synchronizer
     */
    public void setSynchronizer(WebsocketTxSync sync) {
        this.synchronizer = sync;
    }

//    /**
//     * As soon as this bean is construct, make sure there is a synchronizer bound to the current
//     * transaction
//     */
//    @AfterBegin
//    //@PostConstruct
//    public void construct() {
//        logger.trace("NEW TRANSACTION BEANLIFE CYCLE");
//        if (jtaSyncRegistry != null) {
//            if (synchronizer == null) {
//                logger.trace("Create Sync");
//                synchronizer = new WebsocketTxSync(this);
//                jtaSyncRegistry.registerInterposedSynchronization(synchronizer);
//            } else {
//                logger.trace("Synchronizer already registered");
//            }
//        } else {
//            logger.error(" * NULL -> NO-CONTEXT");
//        }
//    }
    /**
     * Register updated object within the WS JTA synchronizer.
     *
     * @param o object to register
     */
    public void registerUpdate(WithWebsocketChannels o) {
        // make sure txManager exists by just touching it
        txManager.touch();
        updated.add(o);
        logger.trace("UpdatedSet: {}", updated);
    }

    /**
     * Register updated objects within the WS JTA synchronizer.
     *
     * @param c collection of objects to register
     */
    public void registerUpdates(Collection<WithWebsocketChannels> c) {
        // make sure txManager exists by just touching it
        txManager.touch();
        updated.addAll(c);
        logger.trace("UpdatedSet: {}", updated);
    }

    /**
     * Register deleted objects within the WS JTA synchronizer
     *
     * @param c just deleted objects
     */
    public void registerDeletion(Collection<? extends WithWebsocketChannels> c) {
        // make sure txManager exists by just touching it
        txManager.touch();
        c.stream()
            .map(IndexEntry::build)
            .forEach(deleted::add);
        logger.trace("Deleted set: {}", deleted);
    }

    /**
     * Register deleted object within the WS JTA synchronizer
     *
     * @param o just deleted object
     */
    public void registerDeletion(WithWebsocketChannels o) {
        // make sure txManager exists by just touching it
        txManager.touch();
        deleted.add(IndexEntry.build(o));
        logger.trace("Deleted set: {}", deleted);
    }

    /**
     * Pre compute the message.
     */
    private void precomputeMessage() {
        try {
            logger.debug("Precompute messages; Update:{}, Deletes:{}", updated, deleted);
            // filter updates to keep only those who haven't been deleted
            Set<WithWebsocketChannels> filtered = updated.stream()
                .filter(
                    (u) -> !deleted.stream()
                        .anyMatch((d) -> d.equals(u))
                ).collect(Collectors.toSet());

            this.precomputed = true;
            requestManager.sudo(() -> {
                return this.message = WebsocketMessagePreparer.prepareWsMessage(userDao, cardTypeDao, filtered, deleted);
            });
            logger.debug("Precomputed: {}", message);
        } catch (Exception ex) {
            logger.error("Failed to precompute websocket messages", ex);
        }
    }

    /**
     * Prepare websocket messages
     */
    public void prepare() {
        //make sure to flush everything to database: EDIT 20211118: seems useless
        //em.flush();
        requestManager.setTxDone(true);
        //logger.info(
        //    "Before transactionCompletion: This method is not called for each transaction, why ???");
        this.precomputeMessage();
    }

    /**
     * After completion callback
     *
     * @param status transaction {@link Status status}
     */
    public void afterCompletion(int status) {
        switch (status) {
            case Status.STATUS_COMMITTED:
                logger.trace("Commit TX");
                this.commit();
                break;
            case Status.STATUS_ROLLEDBACK:
                logger.trace("Rollback TX");
                this.rollback();
                break;
            default:
                logger.warn("Unknonwn status {}", status);
                break;
        }
        // clear the synchronizer, so any new transaction will recreate one
        this.synchronizer = null;
    }

    /**
     * On transaction rollback
     */
    private void rollback() {
        /* no-op */
    }

    /**
     * After commit, send pre-computed messages.
     */
    private void commit() {
        logger.debug("After transaction completion: {}", message);
        requestManager.setTxDone(true);
        if (!precomputed) {
            logger.warn("Messages were not precomputed @BeforeCompletion!!!");
            // message shall be precomputed during the "before completion" phase, but the
            // dedicated method is never called, and I do not understand the reason...
            this.precomputeMessage();
        }
        if (message != null && !message.getMessages().isEmpty()) {
            logger.debug("Send messages: {}", message);
            websocketManager.propagate(message);
        }
    }
}
