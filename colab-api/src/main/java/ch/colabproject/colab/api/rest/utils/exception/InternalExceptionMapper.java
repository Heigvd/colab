/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.utils.exception;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/**
 * Intercept exception and send them back to client with correct HTTP status
 *
 * @author maxence
 */
@Provider
public class InternalExceptionMapper extends AbstractExceptionMapper
    implements ExceptionMapper<Exception> {

    /**
     *
     * @param exception exception to process
     *
     * @return a HTTP response which wrap the exception
     */
    @Override
    public Response toResponse(Exception exception) {
        return processException(exception);
    }
}
