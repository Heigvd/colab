/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.plugin.rest;

/**
 * Error handler
 *
 * @author maxence
 */
public interface ErrorHandler {

    /**
     * Error handler
     *
     * @param error error payload
     */
    void handleError(Object error);
}
