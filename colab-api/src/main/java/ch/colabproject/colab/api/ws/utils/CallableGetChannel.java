/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.utils;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.controller.CdiBridgeSingleton;
import ch.colabproject.colab.api.ws.channel.model.WebsocketChannel;
import java.io.Serializable;
import java.util.Map;
import java.util.concurrent.Callable;

/**
 * Serializable callable to be submitted to all instances of the cluster.
 *
 * @author maxence
 */
public class CallableGetChannel
    implements
    Serializable,
    Callable<Map<WebsocketChannel, Integer>> {

    private static final long serialVersionUID = 1L;

    @Override
    public Map<WebsocketChannel, Integer> call() throws Exception {
        CdiBridgeSingleton cdiBridge = Helper.lookup(CdiBridgeSingleton.class);
        if (cdiBridge != null) {
            return cdiBridge.getSubscriptionsCount();
        } else {
            return Map.of();
        }
    }

}
