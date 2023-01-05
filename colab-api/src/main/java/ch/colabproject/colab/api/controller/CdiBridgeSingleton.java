/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller;

import ch.colabproject.colab.api.microchanges.live.LiveManager;
import java.util.Map;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Single which give access to the CDI world.
 *
 * @author maxence
 */
@Singleton
@Startup
public class CdiBridgeSingleton {

    /**
     * Logger. Default level, set in logback.xml, is INFO
     */
    private static final Logger logger = LoggerFactory.getLogger(CdiBridgeSingleton.class);

    /**
     * Websockets
     */
    @Inject
    private WebsocketManager websocketManager;

    /**
     * LiveManager
     */
    @Inject
    private LiveManager liveManager;

    /**
     * Initialize the non-CDI bean
     */
    public void init() {
        /* no iop */
    }

    /**
     * Bridge to {@link WebsocketManager#getSubscriptionsCount() }
     *
     * @return the list of channels and the number of sessions subscribed to each of them
     */
    public Map<String, Integer> getSubscriptionsCount() {
        logger.debug("Get bridged Subscriptions");
        return websocketManager.getSubscriptionsCount();
    }

    /**
     * Bridge to {@link LiveManager#cancelDebounce(java.lang.Long) }
     * <p>
     * Cancel any debounce call related to the given blockId
     *
     * @param id id of the block
     *
     * @return true if there was something to cancel
     */
    public Boolean cancelDebounce(Long id) {
        return liveManager.cancelDebounce(id);
    }

    /**
     * Bridge to {@link LiveManager#process(java.lang.Long) }.
     * <p>
     * Process all pending changes and save new value to database.
     *
     * @param id id of the block to process
     */
    public void processMicroChanges(Long id) {
        liveManager.process(id);
    }

}
