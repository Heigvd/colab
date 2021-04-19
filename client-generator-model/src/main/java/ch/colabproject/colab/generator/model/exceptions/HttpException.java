/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.model.exceptions;

import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import javax.ejb.ApplicationException;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.ws.rs.core.Response;

/**
 * run-time exception which may be sent back to client.
 *
 * @author maxence
 */
@ApplicationException(rollback = true)
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public abstract class HttpException extends RuntimeException implements WithJsonDiscriminator {

    private static final long serialVersionUID = 1L;

    /**
     * HTTP status
     */
    private final Response.Status httpStatus;

    /**
     * Create a default error with HTTP 400 bad request status
     */
    public HttpException() {
        this(Response.Status.BAD_REQUEST);
    }

    /**
     * Create error with custom HTTP status
     *
     * @param httpStatus HTTP status code
     */
    public HttpException(Response.Status httpStatus) {
        this.httpStatus = httpStatus;
    }

    @JsonbTransient
    @Override
    public synchronized Throwable getCause() {
        return super.getCause();
    }

    @JsonbTransient
    @Override
    public StackTraceElement[] getStackTrace() {
        return super.getStackTrace();
    }

    /**
     * Get the code to use to send HTTP response
     *
     * @return HTTP code, should be 400+
     */
    @JsonbTransient
    public Response.Status getHttpStatus() {
        return this.httpStatus;
    }

    /*
     * want to ignore getSuppressed() as well, but the method is final.
     * Setting custom JsonbVisibility stategry on this class is useles as super properties are
     * not filter by this strategy...
     */

}
