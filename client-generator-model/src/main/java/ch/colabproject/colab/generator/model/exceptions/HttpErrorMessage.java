/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.model.exceptions;

import javax.ws.rs.core.Response;

/**
 * Throw an error message.
 *
 * @author maxence
 */
public class HttpErrorMessage extends HttpException {

    private static final long serialVersionUID = 1L;

    /**
     * List of message type
     */
    public enum MessageCode {
        AUTHENTICATION_FAILED,
        AUTHENTICATION_REQUIRED,
        ACCESS_DENIED,
        BAD_REQUEST,
        NOT_FOUND,
        USERNAME_ALREADY_TAKEN,
        SMTP_ERROR,
        EMAIL_MESSAGE_ERROR,
        RELATED_OBJECT_NOT_FOUND,
        DATA_INTEGRITY_FAILURE,
    }

    /**
     * Error message
     */
    private MessageCode messageCode;

    /**
     * Default bad request error
     */
    public HttpErrorMessage() {
        this(Response.Status.BAD_REQUEST, MessageCode.BAD_REQUEST);
    }

    /**
     * Create a new error message with a HTTP 400 bad request status
     *
     * @param messageCode error message code
     */
    private HttpErrorMessage(MessageCode messageCode) {
        this(Response.Status.BAD_REQUEST, messageCode);
    }

    /**
     * Create a new error message
     *
     * @param status      custom HTTP status
     * @param messageCode error message code
     */
    private HttpErrorMessage(Response.Status status, MessageCode messageCode) {
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
     * @return 400 invalid bad request
     */
    public static HttpErrorMessage badRequest() {
        return new HttpErrorMessage(HttpErrorMessage.MessageCode.BAD_REQUEST);
    }

    /**
     * @return 404 not found
     */
    public static HttpErrorMessage notFound() {
        return new HttpErrorMessage(Response.Status.NOT_FOUND,
            HttpErrorMessage.MessageCode.NOT_FOUND);
    }

    /**
     * @return 403 Forbidden
     */
    public static HttpErrorMessage forbidden() {
        return new HttpErrorMessage(Response.Status.FORBIDDEN,
            HttpErrorMessage.MessageCode.ACCESS_DENIED);
    }

    /**
     * @return 401 Unauthorized
     */
    public static HttpErrorMessage authenticationRequired() {
        return new HttpErrorMessage(Response.Status.UNAUTHORIZED,
            HttpErrorMessage.MessageCode.AUTHENTICATION_REQUIRED);
    }

    /**
     * @return 400 username already taken
     */
    public static HttpErrorMessage userNameAlreadyTaken() {
        return new HttpErrorMessage(HttpErrorMessage.MessageCode.USERNAME_ALREADY_TAKEN);
    }

    /**
     * @return 400 authentication failed
     */
    public static HttpErrorMessage authenticationFailed() {
        return new HttpErrorMessage(HttpErrorMessage.MessageCode.AUTHENTICATION_FAILED);
    }

    /**
     * @return 400 SMTP error
     */
    public static HttpErrorMessage smtpError() {
        return new HttpErrorMessage(HttpErrorMessage.MessageCode.SMTP_ERROR);
    }

    /**
     * @return 400 Malformed Email Message
     */
    public static HttpErrorMessage emailMessageError() {
        return new HttpErrorMessage(HttpErrorMessage.MessageCode.EMAIL_MESSAGE_ERROR);
    }

    /**
     * @return 400 Related object not found
     */
    public static HttpErrorMessage relatedObjectNotFoundError() {
        return new HttpErrorMessage(HttpErrorMessage.MessageCode.RELATED_OBJECT_NOT_FOUND);
    }

    /**
     * @return 400 Data integrity problem
     */
    public static HttpErrorMessage dataIntegrityFailure() {
        return new HttpErrorMessage(HttpErrorMessage.MessageCode.DATA_INTEGRITY_FAILURE);
    }

}
