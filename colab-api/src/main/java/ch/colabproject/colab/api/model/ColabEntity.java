/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.generator.model.interfaces.WithId;
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import javax.json.bind.annotation.JsonbTypeDeserializer;

/**
 * Simple interface which depicts persisted object that may be exchanged with clients
 *
 * @author maxence
 */
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public interface ColabEntity
    extends WithId, WithJsonDiscriminator, WithTrackingData, WithPermission {

    /**
     * Update this object according to values provided by other
     *
     * @param other object to take new values from
     *
     * @throws ColabMergeException if merging is not possible
     */
    void merge(ColabEntity other) throws ColabMergeException;

    /**
     * Duplicate this object according to values provided by other
     *
     * @param other object to take new values from
     *
     * @throws ColabMergeException if merging is not possible
     */
    default void duplicate(ColabEntity other) throws ColabMergeException {
        merge(other);
    }
}
