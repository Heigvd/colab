/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.monitoring;

import ch.colabproject.colab.api.controller.monitoring.LevelDescriptor;
import ch.colabproject.colab.api.controller.monitoring.MonitoringManager;
import ch.colabproject.colab.api.controller.monitoring.VersionDetails;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import java.util.Map;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

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
    private MonitoringManager monitoringManager;

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
     * Get current version
     *
     * @return details about current deployed version
     */
    @GET
    @Path("version")
    public VersionDetails getVersion() {
        return monitoringManager.getVersionDetails();
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
        monitoringManager.changeLogerLevelClusterWide(loggerName, level);
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
        return monitoringManager.getLoggerLevels();
    }
}
