/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.monitoring;

import ch.colabproject.colab.api.model.monitoring.CronJobLog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import java.util.List;

/**
 * @author mikkelvestergaard
 */
public class CronJobLogDao {

    /**
     * logger
     */
    private static final Logger logger = LoggerFactory.getLogger(CronJobLogDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Get all cronJobLogs
     *
     * @return list of all cronJobLogs
     */
    public List<CronJobLog> findAllCronJobLogs() {
        logger.trace("find all cronJobLogs");

        TypedQuery<CronJobLog> query = em.createNamedQuery("CronJobLog.findAll", CronJobLog.class);

        return query.getResultList();
    }

}
