/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.plugin;

import org.apache.maven.plugin.logging.Log;

/**
 * Print message with a Maven Log.
 *
 * @author maxence
 */
public class Logger {

    /**
     * Maven process logger.
     */
    private static Log log = null;

    /**
     * never-called private constructor
     */
    private Logger() {
        throw new UnsupportedOperationException(
            "This is a utility class and cannot be instantiated");
    }

    /**
     * Initialize logger.
     *
     * @param log the logger to use
     */
    public static void initLogger(Log log) {
        Logger.log = log;
    }

    /**
     * Check if log is initialized.
     *
     * @return true if log is not null
     */
    public static boolean isInit() {
        return Logger.log != null;
    }

    /**
     * Print a debug message.
     *
     * @param msg the message
     */
    @SuppressWarnings("PMD.SystemPrintln")
    public static void debug(String msg) {
        if (log != null) {
            log.debug(msg);
        } else {
            System.out.println(msg);
        }
    }

    /**
     * Print a info message.
     *
     * @param msg the message
     */
    @SuppressWarnings("PMD.SystemPrintln")
    public static void info(String msg) {
        if (log != null) {
            log.info(msg);
        } else {
            System.out.println(msg);
        }
    }

    /**
     * Print a warn message.
     *
     * @param msg the message
     */
    @SuppressWarnings("PMD.SystemPrintln")
    public static void warn(String msg) {
        if (log != null) {
            log.warn(msg);
        } else {
            System.err.println(msg);
        }
    }

    /**
     * Print an error message.
     *
     * @param msg the message
     */
    @SuppressWarnings("PMD.SystemPrintln")
    public static void error(String msg) {
        if (log != null) {
            log.error(msg);
        } else {
            System.err.println(msg);
        }
    }
}
