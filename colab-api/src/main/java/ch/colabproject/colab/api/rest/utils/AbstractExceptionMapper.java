/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.utils;

import ch.colabproject.colab.api.exceptions.ColabHttpException;
import javax.ejb.EJBException;
import javax.validation.ConstraintViolationException;
import javax.ws.rs.core.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Intercept exception and send them back to client
 *
 * @author maxence
 */
public class AbstractExceptionMapper {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(AbstractExceptionMapper.class);

    /**
     *
     * @param exception exception to process
     *
     * @return a HTTP response which wrap the exception
     */
    protected Response processException(Exception exception) {
        if (exception == null) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        } else if (exception instanceof EJBException) {
            return processException(((EJBException) exception).getCausedByException());
        } else if (exception instanceof ColabHttpException) {
            return Response.status(((ColabHttpException) exception).getHttpStatus())
                .entity(exception)
                .build();
        } else if (exception instanceof ConstraintViolationException) {
            ConstraintViolationException constraintViolation
                = (ConstraintViolationException) exception;
            logger.error("Constraint Violation Error");
            constraintViolation.getConstraintViolations().forEach(violation -> {
                logger.error(" Violation: {}", violation);
            });
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(constraintViolation.toString())
                .build();
        } else {
            logger.error("Unknown Internal Error", exception);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(exception.toString())
                .build();
        }
    }

}
