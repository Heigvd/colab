/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.utils.exception;

import javax.ejb.EJBException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

/**
 * Intercept exception and send them back to client with correct HTTP status.
 *
 * @author maxence
 */
@Provider
public class EjbExceptionMapper extends AbstractExceptionMapper
    implements ExceptionMapper<EJBException> {

    /**
     *
     * @param exception exception to process
     *
     * @return a HTTP response which wrap the exception
     */
    @Override
    public Response toResponse(EJBException exception) {
        return processException(exception);
    }

}
