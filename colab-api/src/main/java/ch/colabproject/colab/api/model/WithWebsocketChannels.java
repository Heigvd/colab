/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model;

import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.generator.model.interfaces.WithId;
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbTypeDeserializer;

/**
 * Depict an entity which can be propagated through websocket.
 *
 * @author maxence
 */
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public interface WithWebsocketChannels extends WithId, WithJsonDiscriminator {

    /**
     * Get the channels this entity shall be sent through.
     *
     * @return list of channels
     */
    @JsonbTransient
    ChannelsBuilder getChannelBuilder();

    /**
     * Get the payload to embed within an IndexEntry
     *
     * @return the payload
     */
    @JsonbTransient
    default Object getIndexEntryPayload() {
        return null;
    }

}
