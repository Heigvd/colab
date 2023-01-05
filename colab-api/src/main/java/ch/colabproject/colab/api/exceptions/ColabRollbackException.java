/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.exceptions;

/**
 * To rollback the transaction
 *
 * @author maxence
 */
public class ColabRollbackException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * New co.LAB rollback exception.
     *
     * @param cause the cause (which is saved for later retrieval by the {@link #getCause()}
     *              method). (A {@code null} value is permitted, and indicates that the cause is
     *              nonexistent or unknown.)
     */
    public ColabRollbackException(Throwable cause) {
        super(cause);
    }

}
