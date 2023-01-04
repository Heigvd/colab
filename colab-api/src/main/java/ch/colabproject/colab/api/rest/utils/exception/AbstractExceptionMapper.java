/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.utils.exception;

import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.HttpException;
import javax.ejb.EJBException;
import javax.persistence.PersistenceException;
import javax.transaction.RollbackException;
import javax.validation.ConstraintViolationException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.MediaType;
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
     * @param exception exception to process
     *
     * @return a HTTP response which wrap the exception
     */
    protected Response processException(Exception exception) {
        if (exception == null) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        } else if (exception instanceof HttpException) {
            return Response.status(((HttpException) exception).getHttpStatus())
                .type(MediaType.APPLICATION_JSON)
                .entity(exception)
                .build();
        } else if (exception instanceof NotFoundException) {
            return processException(HttpErrorMessage.notFound());
        } else if (exception instanceof EJBException) {
            return processException(((EJBException) exception).getCausedByException());
        } else if (exception instanceof PersistenceException
            | exception instanceof RollbackException) {
            Throwable cause = exception.getCause();
            if (cause instanceof Exception) {
                return processException((Exception) cause);
            }
        } else if (exception instanceof ConstraintViolationException) {
            ConstraintViolationException constraintViolation = (ConstraintViolationException) exception;
            logger.error("Constraint Violation Error");
            constraintViolation.getConstraintViolations().forEach(violation -> {
                logger.error(" Violation: {}", violation);
            });
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(constraintViolation.toString())
                .build();
        }

        logger.error("Unknown Internal Error", exception);
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
            .entity(exception.toString())
            .build();
    }

}
