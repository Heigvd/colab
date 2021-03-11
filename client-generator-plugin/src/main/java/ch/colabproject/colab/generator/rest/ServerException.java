/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.rest;

import javax.ws.rs.core.Response;

/**
 * Server 5xx error
 *
 * @author maxence
 */
public class ServerException extends HttpException {

    private static final long serialVersionUID = 1L;

    /**
     * Create a server error exception
     *
     * @param status HTTP status
     */
    public ServerException(Response.Status status) {
        super(status);
    }

}
