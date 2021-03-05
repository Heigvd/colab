/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.utils;

import ch.colabproject.colab.api.exceptions.ColabHttpException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

/**
 * Intercept exception and send them back to client with correct HTTP status
 *
 * @author maxence
 */
@Provider
public class InternalExceptionMapper implements ExceptionMapper<Exception> {

    /**
     *
     * @param exception exception to process
     *
     * @return a HTTP response which wrap the exception
     */
    @Override
    public Response toResponse(Exception exception) {
        if (exception instanceof ColabHttpException) {
            return Response.status(((ColabHttpException) exception).getHttpStatus())
                .entity(exception)
                .build();
        } else {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(exception)
                .build();
        }
    }

}
