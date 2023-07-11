/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model;

import ch.colabproject.colab.api.model.common.Tracking;
import ch.colabproject.colab.api.model.user.User;
import java.time.OffsetDateTime;

/**
 * Simple interface which depicts objects having tracking data
 *
 * @author sandra
 */
public interface WithTrackingData {

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
        String username = user != null ? user.getUsername() : null;
        OffsetDateTime now = OffsetDateTime.now();

        Tracking trackingData = getTrackingData();
        if (trackingData == null) {
            setTrackingData(new Tracking());
            trackingData = getTrackingData();

            trackingData.setCreatedBy(username);
            trackingData.setCreationTime(now);
        }

        trackingData.setModifiedBy(username);
        trackingData.setModificationTime(now);
    }

}
