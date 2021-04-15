/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.channel;

import ch.colabproject.colab.api.persistence.user.UserDao;
import java.util.Set;

/**
 * A channel that can not be used as-is. It represent a conceptual channel. It should be resolved to
 * a set of {@link WebsocketEffectiveChannel}.
 *
 * @author maxence
 */
public abstract class WebsocketMetaChannel extends WebsocketChannel {

    /**
     * Resolve the meta channel to a list of effective channels.
     *
     * @param userDao some resolver may need to fetch user from DB
     *
     * @return list of effective channels
     */
    public abstract Set<WebsocketEffectiveChannel> resolve(UserDao userDao);
}
