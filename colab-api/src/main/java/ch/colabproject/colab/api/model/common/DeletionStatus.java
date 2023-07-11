/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.common;

/**
 * Enumeration of the different states of deletion.
 * <p>
 * When an
 *
 * @author sandra
 */
//WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
public enum DeletionStatus {
    /**
     * It is removed but can be found in a bin and recovered.
     */
    BIN,

    /**
     * Ready to be definitively deleted on next deletion run
     */
    TO_DELETE;

    // WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
}
