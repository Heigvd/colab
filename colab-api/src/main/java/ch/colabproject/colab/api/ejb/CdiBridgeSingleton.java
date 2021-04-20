/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.ws.channel.WebsocketEffectiveChannel;
import java.util.Map;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Single which give access to the CDI world.
 *
 * @author maxence
 */
@ApplicationScoped
public class CdiBridgeSingleton {

    /**
     * Logger. Default level, set in logback.xml, is INFO
     */
    private static final Logger logger = LoggerFactory.getLogger(CdiBridgeSingleton.class);

    /**
     * Expose application-scoped instance to non-CDI world
     */
    private static CdiBridgeSingleton self;

    /**
     * Websockets
     */
    @Inject
    private WebsocketFacade websocketFacade;

    /**
     * Initialize the non-CDI bean
     */
    public void init() {
        CdiBridgeSingleton.self = this;
    }

    /**
     * Give non-CDI world access to this bean
     *
     * @return singleton instance
     */
    public static CdiBridgeSingleton getInstance() {
        return CdiBridgeSingleton.self;
    }

    /**
     * Bridge to {@link WebsocketFacade#getSubscrciptionsCount() }
     *
     * @return the list of channels and the number of sessions subscribed to each of them
     */
    public Map<WebsocketEffectiveChannel, Integer> getSubscrciptionsCount() {
        logger.debug("Get bridged Subscriptions");
        return websocketFacade.getSubscrciptionsCount();
    }
}
