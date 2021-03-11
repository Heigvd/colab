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
        AUTHENTICATION_FAILED,
        AUTHENTICATION_REQUIRED,
        ACCESS_DENIED,
        BAD_REQUEST,
        INVALID_REQUEST,
        NOT_FOUND,
        USERNAME_ALREADY_TAKEN,
        SMTP_ERROR,
        EMAIL_MESSAGE_ERROR,
    }

    /**
     * Error message
     */
    private MessageCode messageCode;

    /**
     * Default bad request error
     */
    public ColabErrorMessage() {
        this(Response.Status.BAD_REQUEST, MessageCode.BAD_REQUEST);
    }

    /**
     * Create a new error message with a HTTP 400 bad request status
     *
     * @param messageCode error message code
     */
    private ColabErrorMessage(MessageCode messageCode) {
        this(Response.Status.BAD_REQUEST, messageCode);
    }

    /**
     * Create a new error message
     *
     * @param status      custom HTTP status
     * @param messageCode error message code
     */
    private ColabErrorMessage(Response.Status status, MessageCode messageCode) {
        super(status);
        this.messageCode = messageCode;
    }

    /**
     * @return message code
     */
    public MessageCode getMessageCode() {
        return messageCode;
    }

    /**
     * Set message code
     *
     * @param messageCode message code
     */
    public void setMessageCode(MessageCode messageCode) {
        this.messageCode = messageCode;
    }

    /**
     * @return 400 invalid request error
     */
    public static ColabErrorMessage invalidRequest() {
        return new ColabErrorMessage(ColabErrorMessage.MessageCode.INVALID_REQUEST);
    }

    /**
     * @return 404 not found
     */
    public static ColabErrorMessage notFound() {
        return new ColabErrorMessage(Response.Status.NOT_FOUND,
            ColabErrorMessage.MessageCode.NOT_FOUND);
    }

    /**
     * @return 403 Forbidden
     */
    public static ColabErrorMessage forbidden() {
        return new ColabErrorMessage(Response.Status.FORBIDDEN,
            ColabErrorMessage.MessageCode.ACCESS_DENIED);
    }

    /**
     * @return 401 Unauthorized
     */
    public static ColabErrorMessage authenticationRequired() {
        return new ColabErrorMessage(Response.Status.UNAUTHORIZED,
            ColabErrorMessage.MessageCode.AUTHENTICATION_REQUIRED);
    }

    /**
     * @return 400 username already taken
     */
    public static ColabErrorMessage userNameAlreadyTaken() {
        return new ColabErrorMessage(ColabErrorMessage.MessageCode.USERNAME_ALREADY_TAKEN);
    }

    /**
     * @return 400 authentication failed
     */
    public static ColabErrorMessage authenticationFailed() {
        return new ColabErrorMessage(ColabErrorMessage.MessageCode.AUTHENTICATION_FAILED);
    }

    /**
     * @return 400 SMTP error
     */
    public static ColabErrorMessage smtpError() {
        return new ColabErrorMessage(ColabErrorMessage.MessageCode.SMTP_ERROR);
    }

    /**
     * @return 400 Malformed Email Message
     */
    public static ColabErrorMessage emailMessageError() {
        return new ColabErrorMessage(ColabErrorMessage.MessageCode.EMAIL_MESSAGE_ERROR);
    }

}
