/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.exceptions;

import javax.ws.rs.core.Response;

/**
 * Throw an error message.
 *
 * @author maxence
 */
public class ColabErrorMessage extends ColabHttpException {

    private static final long serialVersionUID = 1L;

    /**
     * List of message type
     */
    public enum MessageCode {
        INVALID_REQUEST,
        AUTHENTICATION_FAILED,
        USERNAME_ALREADY_TAKEN,
    }

    /**
     * Error message
     */
    private final MessageCode messageCode;

    /**
     * Create a new error message with a HTTP 400 bad request status
     *
     * @param messageCode error message code
     */
    public ColabErrorMessage(MessageCode messageCode) {
        this(Response.Status.BAD_REQUEST, messageCode);
    }

    /**
     * Create a new error message
     *
     * @param status      custom HTTP status
     * @param messageCode error message code
     */
    public ColabErrorMessage(Response.Status status, MessageCode messageCode) {
        super(status);
        this.messageCode = messageCode;
    }

    /**
     * @return message code
     */
    public MessageCode getMessageCode() {
        return messageCode;
    }
}
