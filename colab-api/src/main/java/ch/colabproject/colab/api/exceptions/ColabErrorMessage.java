/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.exceptions;

/**
 * Throw an error message.
 *
 * @author maxence
 */
public class ColabErrorMessage extends Exception {

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
