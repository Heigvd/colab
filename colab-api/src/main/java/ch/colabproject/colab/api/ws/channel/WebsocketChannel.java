/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.channel;

import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import javax.json.bind.annotation.JsonbTypeDeserializer;

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
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public interface WebsocketChannel extends WithJsonDiscriminator {
    /* Abstract class */
}
