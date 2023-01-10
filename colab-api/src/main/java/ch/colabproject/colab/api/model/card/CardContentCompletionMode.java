/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

/**
 * Defines how the completion level is handled
 *
 * @author sandra
 */
// WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
public enum CardContentCompletionMode {
    /**
     * manually
     */
    MANUAL,
    /**
     * automatically
     */
    AUTO,
    /**
     * no completion at all (no-op)
     */
    NO_OP;

    // WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
}
