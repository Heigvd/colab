/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.monitoring;

import ch.colabproject.colab.api.model.monitoring.CronJobLog;
import ch.colabproject.colab.api.persistence.jpa.monitoring.CronJobLogDao;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.List;

/**
 * REST CronJobLog controller
 *
 * @author mikkelvestergaard
 */
@Path("cronJobLogs")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class CronJobLogRestEndpoint {

    /**
     * logger
     */
    private static final Logger logger = LoggerFactory.getLogger(CronJobLogRestEndpoint.class);

    /**
     * CronJobLog persistence handler
     */
    @Inject
    private CronJobLogDao cronJobLogDao;

    /**
     * Get all cron job logs
     *
     * @return list of all cron job logs
     */
    @GET
    @AdminResource
    public List<CronJobLog> getAllCronJobLogs() {
        logger.debug("get all cron job logs");
        return cronJobLogDao.findAllCronJobLogs();
    }
}
