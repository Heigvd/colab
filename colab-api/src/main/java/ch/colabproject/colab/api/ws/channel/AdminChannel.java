/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.channel;

import ch.colabproject.colab.api.ejb.RequestManager;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * A meta channel which will be resolved into a set of {@link UserChannel}, one for each admin
 * {@link ch.colabproject.colab.api.model.user.User user}.
 *
 * @author maxence
 */
public class AdminChannel implements WebsocketMetaChannel {

    private static final long serialVersionUID = 1L;

    /**
     * Admin channel resolve to the set of {@link UserChannel}.
     *
     * @param userDao        used to load all admin from database
     * @param requestManager must sudo to fetch admins
     *
     * @return list of UserChannel for all admin
     */
    @Override
    public Set<WebsocketEffectiveChannel> resolve(UserDao userDao, RequestManager requestManager) {
        return userDao.findAllAdmin().stream()
            .map(user -> user.getEffectiveChannel())
            .collect(Collectors.toSet());
    }
}
