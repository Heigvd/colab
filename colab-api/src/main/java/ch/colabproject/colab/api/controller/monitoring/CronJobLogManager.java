/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.monitoring;

import ch.colabproject.colab.api.model.monitoring.CronJobLog;
import ch.colabproject.colab.api.model.monitoring.CronJobLogName;
import ch.colabproject.colab.api.persistence.jpa.monitoring.CronJobLogDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import java.time.OffsetDateTime;

/**
 * Logic to manage cron job logging
 *
 * @author mikkelvestergaard
 */
@Stateless
@LocalBean
public class CronJobLogManager {

    /**
     * logger
     */
    private static final Logger logger = LoggerFactory.getLogger(CronJobLogManager.class);

    /**
     * CronJobLog persistence
     */
    @Inject
    private CronJobLogDao cronJobLogDao;

    /**
     * Update a cronJobLog's lastRunTime
     *
     * @param jobName name of cronJob to update
     *
     * @return updated cronJobLog
     */
    public CronJobLog updateCronJobLogLastRunTime(CronJobLogName jobName) {
        logger.debug("Update cronJobLog lastRunTime", jobName);

        CronJobLog cronJobLog = cronJobLogDao.findCronJobLogByName(jobName);

        cronJobLog.setLastRunTime(OffsetDateTime.now());

        return cronJobLog;
    }
}
