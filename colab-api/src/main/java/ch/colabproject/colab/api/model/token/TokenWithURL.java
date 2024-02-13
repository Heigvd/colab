/*
 * The coLAB project
 * Copyright (C) 2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token;

import ch.colabproject.colab.api.model.user.HashMethod;

/**
 * Interface to extract the data needed to generate a URL.
 * <p>
 * When a URL is generated, the token hash data are changed.
 *
 * @author sandra
 */

public interface TokenWithURL {

    /**
     * @return the token ID
     */
    Long getId();

    /**
     * When the token is sent, its hash is changed
     *
     * @param hashMethod new value of hash method
     */
    void setHashMethod(HashMethod hashMethod);

    /**
     * When the token is sent, its hash is changed
     *
     * @param hashedToken new value of hashed token
     */
    void setHashedToken(byte[] hashedToken);
}
