/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.ejb.monitoring.LevelDescriptor;
import ch.colabproject.colab.api.ejb.monitoring.MonitoringFacade;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import java.util.Map;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 * REST MonitoringRestEndpoint to monitor the system
 *
 * @author maxence
 */
@Path("monitoring")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class MonitoringRestEndpoint {

    /**
     * Monitoring business logic
     */
    @Inject
    private MonitoringFacade monitoringFacade;

    /**
     * Simple dummy method which return 200 OK
     *
     * @return "Running"
     */
    @GET
    @Path("status")
    public String getStatus() {
        return "Running";
    }

    /**
     * Change level of a logger
     *
     * @param loggerName name of the logger to update
     * @param level      new level of the logger
     *
     */
    @GET
    @Path("SetLoggerLevel/{loggerName}/{level}")
    @AdminResource
    public void changeLoggerLevel(
        @PathParam("loggerName") String loggerName,
        @PathParam("level") String level
    ) {
        monitoringFacade.changeLogerLevelClusterWide(loggerName, level);
    }

    /**
     * Get the description of all known co.LAB logger by providing their current level.
     *
     * @return all known levelDescriptor mapped by the name of the logger
     */
    @GET
    @Path("GetLoggerLevels")
    @AdminResource
    public Map<String, LevelDescriptor> getLoggerLevels() {
        return monitoringFacade.getLoggerLevels();
    }
}
