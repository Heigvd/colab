/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token;

/**
 * Expiration policies available for a token.
 *
 * @author sandra
 */
public enum ExpirationPolicy {
    /**
     * Can be used forever
     */
    NEVER,
    /**
     * Is usable only once
     */
    ONE_SHOT;
}
