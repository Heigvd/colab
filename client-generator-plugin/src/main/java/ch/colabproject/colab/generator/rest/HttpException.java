/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.rest;

import javax.ws.rs.core.Response.Status;

/**
 *
 * @author maxence
 */
public abstract class HttpException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * HTTP error status
     */
    private final Status status;

    /**
     * Create exception with custom HTTP status
     *
     * @param status HTTP status
     */
    public HttpException(Status status) {
        this.status = status;
    }

    /**
     * Get error status
     *
     * @return HTTP status
     */
    public Status getStatus() {
        return status;
    }

}
