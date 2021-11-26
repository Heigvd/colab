/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

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

    /**
     * Each five minutes
     */
    @Schedule(hour = "*", minute = "*")
    public void saveActivityDates() {
        logger.info("CRON: Persist activity dates to database");
        sessionManager.writeActivityDatesToDatabase();
    }
}
