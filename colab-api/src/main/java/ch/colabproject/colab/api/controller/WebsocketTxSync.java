/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller;

import javax.transaction.Synchronization;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * To synchronize websockets with JTA session
 *
 * @author maxence
 */
public class WebsocketTxSync implements Synchronization {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(WebsocketTxSync.class);

    /**
     * the TransactionManaget bound to this synchronizer
     */
    private final EntityGatheringBagForPropagation context;

    /**
     * Make sure to "beforeCompletion" only once
     */
    private boolean beforeDone = false;

    /**
     * Make sure to "afterCompletion" only once
     */
    private boolean afterDone = false;

    /**
     * New Synchronizer to link to the current transaction.
     *
     * @param context TranssactionManager which is in charge for the current transaction
     */
    public WebsocketTxSync(EntityGatheringBagForPropagation context) {
        this.context = context;
    }

    /**
     * At this point, the final state of the transaction in known.
     * <p>
     * From this point, any committed changes will be available to other transactions, and any
     * rolled back changes will be definitely loosed.
     *
     *
     * @param status status of the current transaction, either STATUS_COMMITTED or STATUS_ROLLEDBACK
     */
    @Override
    public void afterCompletion(int status) {
        if (!afterDone) {
            afterDone = true;
            logger.trace("afterCompletion with status: {}", status);
            context.afterCompletion(status);
        }
    }

    /**
     * This is called before just before the commit occurs.
     * <p>
     * A RuntimeException may be thrown if there is any problem with the underling Xapi repository.
     * If so, the transaction will be rolled back
     */
    @Override
    public void beforeCompletion() {
        if (!beforeDone) {
            beforeDone = true;
            logger.trace("beforeCompletion");
            // make sure the commit will success or throw some Runtimeexception
            context.prepare();
        }
    }

}
