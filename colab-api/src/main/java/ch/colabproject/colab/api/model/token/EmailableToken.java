/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token;

/**
 * A token that can be sent by email
 */
public interface EmailableToken extends TokenWithURL {

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
}
