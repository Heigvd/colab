/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.exceptions.ColabRollbackException;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.persistence.user.UserDao;
import ch.colabproject.colab.api.ws.WebsocketHelper;
import ch.colabproject.colab.api.ws.message.IndexEntry;
import ch.colabproject.colab.api.ws.message.PrecomputedWsMessages;
import java.io.Serializable;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import javax.ejb.AfterCompletion;
import javax.ejb.BeforeCompletion;
import javax.ejb.Stateful;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.websocket.EncodeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Transaction sidekick.
 *
 * @author maxence
 */
@RequestScoped // one would use a TransactionScoped bean but such a scope is not compatible with
//                the @AfterCompletion annotation
@Stateful // Stateful beans allows to use Before and AfterCompletion annotations
public class TransactionManager implements Serializable {

    private static final long serialVersionUID = 1L;

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(TransactionManager.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * To send message to clients
     */
    @Inject
    private WebsocketFacade websocketFacade;

    /**
     * To resolve meta channels
     */
    @Inject
    private UserDao userDao;

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
     * Register updated object within the WS JTA synchronizer.
     *
     * @param o object to register
     */
    public void registerUpdate(WithWebsocketChannels o) {
        updated.add(o);
        logger.trace("UpdatedSet: {}", updated);
    }

    /**
     * Register updated objects within the WS JTA synchronizer.
     *
     * @param c collection of objects to register
     */
    public void registerUpdates(Collection<WithWebsocketChannels> c) {
        updated.addAll(c);
        logger.trace("UpdatedSet: {}", updated);
    }

    /**
     * Register deleted objects within the WS JTA synchronizer
     *
     * @param c just deleted objects
     */
    public void registerDeletion(Collection<? extends WithWebsocketChannels> c) {
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
        deleted.add(IndexEntry.build(o));
        logger.trace("Deleted set: {}", deleted);
    }

    /**
     * Pre compute the message.
     */
    private void precomputeMessage() throws EncodeException {
        logger.debug("Precompute messages; Update:{}, Deletes:{}", updated, deleted);
        // filter updateds to keep only those who haven't been deleted
        Set<WithWebsocketChannels> filtered = updated.stream()
            .filter(
                (u) -> !deleted.stream()
                    .anyMatch((d) -> d.equals(u))
            ).collect(Collectors.toSet());

        this.precomputed = true;
        this.message = WebsocketHelper.prepareWsMessage(userDao, filtered, deleted);
        logger.trace("Precomputed: {}", message);
    }

    /**
     * Prepare websocket messages
     */
    @BeforeCompletion
    public void beforeCompletion() {
        //make sure to flush everything to database
        em.flush();
        logger.info(
            "Before transactionCompletion: This method is not called for each transaction, why ???");
        try {
            this.precomputeMessage();
        } catch (EncodeException ex) {
            //throw runtime error to rollback
            throw new ColabRollbackException(ex);
        }
    }

    /**
     * After commit, if the transaction was successful, send pre-computed messages.
     *
     * @param successful true of the transaction was successfully committed
     */
    @AfterCompletion
    public void afterCompletion(boolean successful) {
        logger.debug("After transaction completion : {}; messages: {}", successful, message);
        if (successful) {
            if (!precomputed) {
                logger.info("Messages were not precomputed @BeforeCompletion!!!");
                // ,essage shall be precomputed during the "before completion" phase, but the
                // dedicated method is never called, and I do not understand the reason...
                try {
                    this.precomputeMessage();
                } catch (EncodeException ex) {
                    logger.error("Failed to precompute websocket messages");
                }
            }
            if (message != null && !message.getMessages().isEmpty()) {
                logger.info("Send messages");
                websocketFacade.propagate(message);
            }
        }
    }
}
