/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.plugin.rest;

import ch.colabproject.colab.generator.model.exceptions.HttpException;
import javax.ws.rs.core.Response;

/**
 * 4xx error
 *
 * @author maxence
 */
public class ClientException extends HttpException {

    private static final long serialVersionUID = 1L;

    /**
     *
     */
    public ClientException() {
        this(Response.Status.BAD_REQUEST);
    }

    /**
     * Create a client error exception
     *
     * @param status HTTP status
     */
    public ClientException(Response.Status status) {
        super(status);
    }

}
