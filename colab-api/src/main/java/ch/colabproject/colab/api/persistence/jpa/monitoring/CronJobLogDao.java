/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.monitoring;

import ch.colabproject.colab.api.model.monitoring.CronJobLog;
import ch.colabproject.colab.api.model.monitoring.CronJobLogName;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import java.util.List;

/**
 * Cronjob logs persistence
 *
 * @author mikkelvestergaard
 */
@Stateless
@LocalBean
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

//    /**
//     * Find a cronJobLog by id
//     *
//     * @param id of the cronJobLog to fetch
//     *
//     * @return the cronJobLog with the given id or null if such a cronJobLog does not exist
//     */
//    public CronJobLog findCronJobLog(Long id) {
//        logger.trace("find cronJobLog #{}", id);
//
//        return em.find(CronJobLog.class, id);
//    }

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

    /**
     * Find a cronJobLog by name
     *
     * @param jobName the name of the cronJobLog
     *
     * @return the cronJobLog or null if not found
     */
    public CronJobLog findCronJobLogByName(CronJobLogName jobName) {
        logger.trace("find cronJobLog {}", jobName);

        try {
            return em.createNamedQuery("CronJobLog.findByName", CronJobLog.class)
                    .setParameter("jobName", jobName)
                    .getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    /**
     * Persist the cron job log to the database
     *
     * @param cronJobLog the cron job log to persist
     */
    public void persistCronJobLog(CronJobLog cronJobLog) {
        logger.trace("persist cronJobLog {}", cronJobLog);

        em.persist(cronJobLog);
    }

}
