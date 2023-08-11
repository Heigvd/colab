/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

/**
 * Exception when trying to call the colab-yjs server (that is used to store the lexical text editor
 * data)
 *
 * @author sandra
 */
public class YjsException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * Exception when trying to call the colab-yjs server.
     *
     * @param message the detail message (which is saved for later retrieval by the
     *                {@link #getMessage()} method).
     */
    public YjsException(String message) {
        super(message);
    }

    /**
     * Exception when trying to call the colab-yjs server.
     *
     * @param message the detail message (which is saved for later retrieval by the
     *                {@link #getMessage()} method).
     * @param cause   the cause (which is saved for later retrieval by the {@link #getCause()}
     *                method). (A {@code null} value is permitted, and indicates that the cause is
     *                nonexistent or unknown.)
     */
    public YjsException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Exception when trying to call the colab-yjs server.
     *
     * @param cause the cause (which is saved for later retrieval by the {@link #getCause()}
     *              method). (A {@code null} value is permitted, and indicates that the cause is
     *              nonexistent or unknown.)
     */
    public YjsException(Throwable cause) {
        super(cause);
    }
}
