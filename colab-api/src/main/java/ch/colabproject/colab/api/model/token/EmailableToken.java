/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token;

import ch.colabproject.colab.api.model.user.HashMethod;

/**
 * A token that can be sent by email
 */
public interface EmailableToken {

    /**
     * @param link link to embed in the body
     *
     * @return email body html text
     */
    String getEmailBody(String link);

    /**
     * @return the message subject
     */
    String getSubject();

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
