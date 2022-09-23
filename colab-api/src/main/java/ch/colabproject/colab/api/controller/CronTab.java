/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller;

import ch.colabproject.colab.api.controller.document.ExternalDataManager;
import ch.colabproject.colab.api.security.SessionManager;
import javax.ejb.Schedule;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    /**
     * Each minutes
     */
    @Schedule(hour = "*", minute = "*")
    public void saveActivityDates() {
        logger.info("CRON: Persist activity dates to database");
        sessionManager.writeActivityDatesToDatabase();
    }

    /**
     * each midnight, clear expired sessions
     */
    @Schedule(hour = "0", minute = "0")
    public void dropOldHttpSession() {
        logger.info("CRON: drop expired http session");
        sessionManager.clearExpiredSessions();
    }

    /**
     * each 00:30, clean outdated UrlMetadata
     */
    @Schedule(hour = "0", minute = "30")
    public void dropOldUrlMetadata() {
        logger.info("CRON: clean url metadata cache");
        externalDataManager.clearOutdated();
    }
}
