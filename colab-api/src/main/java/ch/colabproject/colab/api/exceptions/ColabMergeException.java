/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.exceptions;

import ch.colabproject.colab.api.model.ColabEntity;

/**
 * Thrown when a merge is not possible
 *
 * @author maxence
 */
public class ColabMergeException extends Exception {

    /**
     * The entity to update
     */
    private final ColabEntity supplier;

    /**
     * The entity to take new values from
     */
    private final ColabEntity receiver;

    /**
     * Create a merge exception
     *
     * @param receiver the object to update
     * @param supplier the object which contains new values
     */
    public ColabMergeException(ColabEntity receiver, ColabEntity supplier) {
        this.receiver = receiver;
        this.supplier = supplier;
    }

    /**
     * {@inheritDoc }
     */
    @Override
    public String getMessage() {
        return "Impossible to patch " + this.receiver + " with " + this.supplier;
    }
}
