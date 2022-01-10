/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller;

import java.io.Serializable;
import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.inject.Inject;
import javax.transaction.TransactionScoped;
import javax.transaction.TransactionSynchronizationRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * To synchronize websockets with JTA session
 *
 * @author maxence
 */
@TransactionScoped
public class WebsocketTxManager implements Serializable {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(WebsocketTxManager.class);

    /**
     * Tx sync registry
     */
    @Resource
    private transient TransactionSynchronizationRegistry jtaSyncRegistry;

    /**
     * The bag
     */
    @Inject
    private EntityGatheringBagForPropagation bean;

    /**
     * make sure bean exists
     */
    public void touch() {
        logger.trace("Touch WsTxManager");
    }

    /**
     * Called each time a new transaction is created.
     */
    @PostConstruct
    public void construct() {
        logger.trace("NEW TRANSACTION BEANLIFE CYCLE");
        if (jtaSyncRegistry != null) {
            WebsocketTxSync synchronizer = bean.getSynchronizer();
            if (synchronizer == null) {
                logger.trace("Create Sync");
                synchronizer = new WebsocketTxSync(bean);
                jtaSyncRegistry.registerInterposedSynchronization(synchronizer);
            } else {
                logger.trace("Synchronizer already registered");
            }
        } else {
            logger.error(" * NULL -> NO-CONTEXT");
        }
    }

}
