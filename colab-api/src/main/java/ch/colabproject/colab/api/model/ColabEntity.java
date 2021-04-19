/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbTypeDeserializer;

/**
 * Simple interface which depict persisted object that may be exchanged with clients
 *
 * @author maxence
 */
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public interface ColabEntity extends WithId {

    /**
     * Get the channels this entity shall be sent through.
     *
     * @return list of channels
     */
    @JsonbTransient
    Set<WebsocketChannel> getChannels();

    /**
     * Update this object according to values provided by other
     *
     * @param other object to take new values from
     *
     * @throws ColabMergeException if merging is not possible
     */
    void merge(ColabEntity other) throws ColabMergeException;
}
