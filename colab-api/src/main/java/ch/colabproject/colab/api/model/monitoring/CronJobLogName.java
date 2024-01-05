/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.monitoring;

/**
 * When a cron job log is created, it can be one of these names
 *
 * @author mikkelvestergaard
 */
public enum CronJobLogName {
    /**
     * Persist activity dates to database
     */
    SAVE_ACTIVITIES_DATE,
    /**
     * Drop expired http session
     */
    DROP_OLD_HTTP_SESSIONS,
    /**
     * Clean url metadata cache
     */
    DROP_OLD_URL_METADATA,
    /**
     * Database backup
     */
    DATABASE_BACKUP,
}
