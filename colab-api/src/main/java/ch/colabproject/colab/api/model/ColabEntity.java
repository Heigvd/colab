/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.tracking.Tracking;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import java.time.OffsetDateTime;
import javax.json.bind.annotation.JsonbTypeDeserializer;

/**
 * Simple interface which depict persisted object that may be exchanged with clients
 *
 * @author maxence
 */
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public interface ColabEntity extends WithId, WithPermission {

    /**
     * Get the tracking data
     *
     * @return the tracking data
     */
    Tracking getTrackingData();

    /**
     * Set the tracking data
     *
     * @param trackingData new tracking data
     */
    void setTrackingData(Tracking trackingData);

    /**
     * Update tracking data
     *
     * @param user current user
     */
    default void touch(User user) {
        Tracking trackingData = getTrackingData();
        String username = user != null ? user.getUsername() : null;
        OffsetDateTime now = OffsetDateTime.now();
        if (trackingData == null) {
            setTrackingData(new Tracking());
            trackingData = getTrackingData();
            trackingData.setCreatedBy(username);
            trackingData.setCreationDate(now);
        }
        trackingData.setModifiedBy(username);
        trackingData.setModificationDate(now);
    }

    /**
     * Update this object according to values provided by other
     *
     * @param other object to take new values from
     *
     * @throws ColabMergeException if merging is not possible
     */
    void merge(ColabEntity other) throws ColabMergeException;
}
