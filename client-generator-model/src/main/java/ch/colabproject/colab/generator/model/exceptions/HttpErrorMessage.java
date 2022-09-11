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
        ACCESS_DENIED,
        AUTHENTICATION_REQUIRED,
        BAD_REQUEST,
        DATA_INTEGRITY_FAILURE,
        EMAIL_MESSAGE_ERROR,
        INTERNAL_SERVER_ERROR,
        PROJECT_QUOTA_EXCEEDED,
        FILE_TOO_BIG,
        RELATED_OBJECT_NOT_FOUND,
        NOT_FOUND,
        SMTP_ERROR,
        /** Impossible to login */
        AUTHENTICATION_FAILED,
        /** Wait before trying again */
        TOO_MANY_ATTEMPTS,
        /** Sign up failure */
        SIGNUP_FAILURE,
        /** Problem processing a token */
        TOKEN_PROCESSING_FAILURE,
    }

    /**
     * Error message
     */
    private MessageCode messageCode;

    /**
     * The key of the translation to display
     */
    private MessageI18nKey messageI18nKey;

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
     * Create a new error message
     *
     * @param status         custom HTTP status
     * @param messageCode    error message code
     * @param messageI18nKey error message translation key
     */
    private HttpErrorMessage(Response.Status status, MessageCode messageCode,
        MessageI18nKey messageI18nKey) {
        this(status, messageCode);
        this.messageI18nKey = messageI18nKey;
    }

    /**
     * Create a new error message
     *
     * @param messageCode    error message code
     * @param messageI18nKey error message translation key
     */
    private HttpErrorMessage(MessageCode messageCode, MessageI18nKey messageI18nKey) {
        this(messageCode);
        this.messageI18nKey = messageI18nKey;
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
     * @return the key of the translation to display
     */
    public MessageI18nKey getMessageI18nKey() {
        return this.messageI18nKey;
    }

    /**
     * @param messageI18nKey the key of the translation to display
     */
    public void setMessageI18nKey(MessageI18nKey messageI18nKey) {
        this.messageI18nKey = messageI18nKey;
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

    /**
     * @return 500 internal server error
     */
    public static HttpErrorMessage internalServerError() {
        return new HttpErrorMessage(Response.Status.INTERNAL_SERVER_ERROR,
            HttpErrorMessage.MessageCode.INTERNAL_SERVER_ERROR);
    }

    /**
     * @return 413 project quota exceeded
     */
    public static HttpErrorMessage projectQuotaExceededError() {
        return new HttpErrorMessage(Response.Status.REQUEST_ENTITY_TOO_LARGE,
            HttpErrorMessage.MessageCode.PROJECT_QUOTA_EXCEEDED);
    }

    /**
     * @return 413 file size limit exceeded
     */
    public static HttpErrorMessage fileSizeLimitExceededError() {
        return new HttpErrorMessage(Response.Status.REQUEST_ENTITY_TOO_LARGE,
            HttpErrorMessage.MessageCode.FILE_TOO_BIG);
    }

    //

    /**
     * @return 400 authentication failed
     */
    public static HttpErrorMessage authenticationFailed() {
        return new HttpErrorMessage(HttpErrorMessage.MessageCode.AUTHENTICATION_FAILED);
    }

    /**
     * @return 429 too many requests
     */
    public static HttpErrorMessage tooManyAttempts() {
        return new HttpErrorMessage(Response.Status.TOO_MANY_REQUESTS,
            HttpErrorMessage.MessageCode.TOO_MANY_ATTEMPTS);
    }

    /**
     * @param i18nKey translation key of the message
     *
     * @return 400 signup failure
     */
    public static HttpErrorMessage signUpFailed(MessageI18nKey i18nKey) {
        return new HttpErrorMessage(MessageCode.SIGNUP_FAILURE, i18nKey);
    }

    /**
     * @param i18nKey translation key of the message
     *
     * @return 400 token processing failure
     */
    public static HttpErrorMessage tokenProcessingFailure(MessageI18nKey i18nKey) {
        return new HttpErrorMessage(MessageCode.TOKEN_PROCESSING_FAILURE, i18nKey);
    }
}
