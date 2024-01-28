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
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
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
     * Create a new cronJobLog with given cronJobLogName
     *
     * @param jobLogName name of the cronJobLog to create
     *
     * @return created cronJobLog
     */
    private CronJobLog createCronJobLog(CronJobLogName jobLogName) {
        CronJobLog cronJobLog = new CronJobLog();
        cronJobLog.setJobName(jobLogName);
        cronJobLogDao.persistCronJobLog(cronJobLog);

        return cronJobLog;
    }

    /**
     * Update a cronJobLog's lastRunTime
     *
     * @param jobName name of cronJob to update
     */
    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public void updateCronJobLogLastRunTime(CronJobLogName jobName) {
        logger.debug("Update cronJobLog lastRunTime {}", jobName);

        CronJobLog cronJobLog = cronJobLogDao.findCronJobLogByName(jobName);

        if (cronJobLog == null) {
            cronJobLog = createCronJobLog(jobName);
        }

        OffsetDateTime now = OffsetDateTime.now();
        cronJobLog.setLastRunTime(now);

    }
}
