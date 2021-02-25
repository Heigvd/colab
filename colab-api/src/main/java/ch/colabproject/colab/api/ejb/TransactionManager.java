/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.WithId;
import java.io.Serializable;
import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.transaction.TransactionScoped;
import javax.transaction.TransactionSynchronizationRegistry;

/**
 * Transaction sidekick.
 *
 * @author maxence
 */
@TransactionScoped
public class TransactionManager implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * JTA registry used to attach websocket synchronizer
     */
    @Resource
    private transient TransactionSynchronizationRegistry jtaSyncRegistry;

    /**
     * Websocket synchronizer
     */
    private WebsocketSynchronizer sync;

    /**
     * Some postConstruct logic. Attach a WS synchronizer to each request
     */
    @PostConstruct
    public void construct() {
        if (jtaSyncRegistry != null && sync == null) {
            sync = new WebsocketSynchronizer();
            jtaSyncRegistry.registerInterposedSynchronization(sync);
        }
    }

    /**
     * Register updated object within the WS JTA synchronizer.
     *
     * @param o object to register
     */
    public void registerUpdate(WithId o) {
        if (sync != null) {
            sync.registerUpdate(o);
        }
    }

    /**
     * Register deleted object within the WS JTA synchronizer
     *
     * @param o just deleted object
     */
    public void registerDelete(WithId o) {
        if (sync != null) {
            sync.registerDelete(o);
        }
    }
}
