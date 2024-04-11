/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller;

import ch.colabproject.colab.api.controller.common.DeletionManager;
import ch.colabproject.colab.api.controller.document.ExternalDataManager;
import ch.colabproject.colab.api.controller.monitoring.CronJobLogManager;
import ch.colabproject.colab.api.model.monitoring.CronJobLogName;
import ch.colabproject.colab.api.security.SessionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.Schedule;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;

/**
 * Do periodic tasks
 *
 * @author maxence
 */
@Singleton
@Startup
public class CronTab {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CronTab.class);

    /** session manager */
    @Inject
    private SessionManager sessionManager;

    /** To manager OpenGraph cache */
    @Inject
    private ExternalDataManager externalDataManager;

    /** To manage CronJobLogs */
    @Inject
    private CronJobLogManager cronJobLogManager;

    /** To access coLAB entities for deletion */
    @Inject
    private DeletionManager deletionManager;

    /**
     * Each minute
     */
    @Schedule(hour = "*", minute = "*", persistent = false)
    public void saveActivityDates() {
        logger.trace("CRON: Persist activity dates to database");
        sessionManager.writeActivityDatesToDatabaseInTrn();
        cronJobLogManager.updateCronJobLogLastRunTime(CronJobLogName.SAVE_ACTIVITIES_DATE);
    }

    /**
     * each midnight, clear expired sessions
     */
    @Schedule(hour = "0", minute = "0", persistent = false)
    public void dropOldHttpSession() {
        logger.info("CRON: drop expired http session");
        sessionManager.clearExpiredHttpSessionsInTrn();
        cronJobLogManager.updateCronJobLogLastRunTime(CronJobLogName.DROP_OLD_HTTP_SESSIONS);
    }

    /**
     * each 00:30, clean outdated UrlMetadata
     */
    @Schedule(hour = "0", minute = "30", persistent = false)
    public void dropOldUrlMetadata() {
        logger.info("CRON: clean url metadata cache");
        externalDataManager.clearOutdated();
        cronJobLogManager.updateCronJobLogLastRunTime(CronJobLogName.DROP_OLD_URL_METADATA);
    }

    /**
     * each one o'clock, definitively delete data
     */
    @Schedule(hour = "1", minute = "0", persistent = false)
    public void cleanBinColabEntities() {
        logger.info("CRON: clean bin");
        deletionManager.cleanBinInTrn();
        cronJobLogManager.updateCronJobLogLastRunTime(CronJobLogName.CLEAN_BIN);
    }

    /**
     * each one o'clock, definitively delete data
     */
    @Schedule(hour = "1", minute = "30", persistent = false)
    public void deleteForeverColabEntities() {
        logger.info("CRON: Delete forever old obsolete colab entities");
        deletionManager.deleteForeverInTrn();
        cronJobLogManager.updateCronJobLogLastRunTime(CronJobLogName.DELETE_FOREVER);
    }
}
