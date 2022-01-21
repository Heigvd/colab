/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.channel;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import java.util.Set;
import javax.json.bind.annotation.JsonbTypeDeserializer;

/**
 * A channel that can not be used as-is. It represent a conceptual channel. It should be resolved to
 * a set of {@link WebsocketEffectiveChannel}.
 *
 * @author maxence
 */
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public interface WebsocketMetaChannel extends WebsocketChannel {

    /**
     * Resolve the meta channel to a list of effective channels.
     *
     * @param userDao        some resolver may need to fetch user from DB
     * @param requestManager some resolver may need to access the request state
     *
     * @return list of effective channels
     */
    Set<WebsocketEffectiveChannel> resolve(UserDao userDao, RequestManager requestManager);
}
