/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.tools;

import ch.colabproject.colab.api.ejb.TransactionManager;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import javax.inject.Inject;
import javax.persistence.PostPersist;
import javax.persistence.PostUpdate;
import javax.persistence.PreRemove;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * JPA Entity listener defined in orm.xml
 *
 * @author maxence
 */
public class EntityListener {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(EntityListener.class);

    /**
     * RequestManager
     */
    @Inject
    private TransactionManager transactionManager;

    /**
     * Track all updates and insert
     *
     * @param o updated or just persisted object
     */
    @PostPersist
    @PostUpdate
    public void onUpdate(Object o) {
        if (o instanceof WithWebsocketChannels) {
            logger.trace("Update {}", o);
            transactionManager.registerUpdate((WithWebsocketChannels) o);
        }
    }

    /**
     * Intercept object just before their deletion
     *
     * @param o just deleted object
     */
    @PreRemove
    public void onDestroy(Object o) {
        if (o instanceof WithWebsocketChannels) {
            logger.trace("Destroy {}", o);
            transactionManager.registerDelete((WithWebsocketChannels) o);
        }
    }
}
