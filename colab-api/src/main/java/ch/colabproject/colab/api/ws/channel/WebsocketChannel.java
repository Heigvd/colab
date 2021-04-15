/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.channel;

import java.io.Serializable;

/**
 * Abstract websocket channel. This class is extended by {@link WebsocketEffectiveChannel} and
 * {@link WebsocketMetaChannel}. Effective Channels exists "for-real" between clients and servers.
 * Meta channels do not exist on their own. They're degraded to a set of effective channels. For
 * Instance, the admin meta-channel resolves to the set of admin-user dedicated channel.
 *
 *
 * @author maxence
 *
 */
public abstract class WebsocketChannel implements Serializable {

    private static final long serialVersionUID = 1L;
}
