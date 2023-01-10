/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.monitoring;

import java.io.Serializable;

/**
 * Serializable description of a logger level.
 *
 * @author maxence
 */
public class LoggerLevelPayload implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Logger level
     */
    private String loggerLevel;

    /**
     * Logger name
     */
    private String loggerName;

    /**
     * Get the level
     *
     * @return the level
     */
    public String getLoggerLevel() {
        return loggerLevel;
    }

    /**
     * Set the logger level
     *
     * @param loggerLevel new level
     */
    private void setLogerLevel(String loggerLevel) {
        this.loggerLevel = loggerLevel;
    }

    /**
     * Set the logger name
     *
     * @param loggerName new name
     */
    private void setLogerName(String loggerName) {
        this.loggerName = loggerName;
    }

    /**
     * Get the logger name
     *
     * @return name of the logger
     */
    public String getLoggerName() {
        return loggerName;
    }

    /**
     * Build a logger level description
     *
     * @param loggerName  the logger name
     * @param loggerLevel the logger level
     *
     * @return the loggerLevel serializable payload
     */
    public static LoggerLevelPayload build(String loggerName, String loggerLevel) {
        LoggerLevelPayload ll = new LoggerLevelPayload();
        ll.setLogerName(loggerName);
        ll.setLogerLevel(loggerLevel);

        return ll;
    }
}
