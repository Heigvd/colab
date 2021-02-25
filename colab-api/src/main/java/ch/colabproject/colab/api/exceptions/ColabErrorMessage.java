/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.exceptions;

import javax.ejb.ApplicationException;

/**
 * Throw an error message.
 *
 * @author maxence
 */
@ApplicationException(rollback = true)
public class ColabErrorMessage extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * List of message type
     */
    public enum MessageCode {
        AUTHENTICATION_FAILED,
        USERNAME_ALREADY_TAKEN,
    }

    /**
     * Error message
     */
    private final MessageCode messageCode;

    /**
     * Create a new error message
     *
     * @param messageCode error message code
     */
    public ColabErrorMessage(MessageCode messageCode) {
        this.messageCode = messageCode;
    }

    /**
     * @return message code
     */
    public MessageCode getMessageCode() {
        return messageCode;
    }
}
