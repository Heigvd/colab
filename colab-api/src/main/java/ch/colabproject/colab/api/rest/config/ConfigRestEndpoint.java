/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.config;

import ch.colabproject.colab.api.controller.config.ConfigurationManager;
import ch.colabproject.colab.api.rest.config.bean.AccountConfig;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

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
