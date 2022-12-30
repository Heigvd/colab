/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.plugin.rest;

import ch.colabproject.colab.generator.model.exceptions.HttpException;
import javax.ws.rs.core.Response;

/**
 * Server 5xx error
 *
 * @author maxence
 */
public class ServerException extends HttpException {

    private static final long serialVersionUID = 1L;

    /**
     * Default 500 error
     */
    public ServerException() {
        this(Response.Status.INTERNAL_SERVER_ERROR);
    }

    /**
     * Create a server error exception
     *
     * @param status HTTP status
     */
    public ServerException(Response.Status status) {
        super(status);
    }

}
