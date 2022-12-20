/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.config;

import ch.colabproject.colab.api.controller.config.ConfigurationManager;
import ch.colabproject.colab.api.rest.config.bean.AccountConfig;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

/**
 * REST MonitoringRestEndpoint to monitor the system
 *
 * @author maxence
 */
@Path("config")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ConfigRestEndpoint {

    /**
     * Monitoring business logic
     */
    @Inject
    private ConfigurationManager configManager;

    /**
     * Get account-related configuration
     *
     * @return configuration
     */
    @GET
    @Path("AccountConfig")
    public AccountConfig getAccountConfig() {
        return configManager.getAccountConfig();
    }

}
