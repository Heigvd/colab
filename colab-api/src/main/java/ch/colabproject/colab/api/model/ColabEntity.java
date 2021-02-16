/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model;

import ch.colabproject.colab.api.exceptions.ColabMergeException;

/**
 * Simple interface which depict persisted object that may be exchanged with clients
 *
 * @author maxence
 */
public interface ColabEntity extends WithId {

    /**
     * Update this object according to values provided by other
     *
     * @param other object to take new values from
     * @throws ColabMergeException if merging is not possible
     */
    void merge(ColabEntity other) throws ColabMergeException;
}
