/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model;

import ch.colabproject.colab.api.model.common.DeletionStatus;

/**
 * Simple interface which depicts objects having a deletion status
 *
 * @author sandra
 */
public interface WithDeletionStatus {

    /**
     * Get the deletion status :
     * <p>
     * Is it in a bin or ready to be definitely deleted.
     * <p>
     * Null means active.
     *
     * @return null or a deletion status
     */
    DeletionStatus getDeletionStatus();

    /**
     * Set the deletion status :
     * <p>
     * Is it in a bin or ready to be definitely deleted.
     * <p>
     * Null means active.
     *
     * @param status null or a deletion status
     */
    void setDeletionStatus(DeletionStatus status);

}
