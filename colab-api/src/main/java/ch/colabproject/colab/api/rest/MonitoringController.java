/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 * REST MonitoringController to monitor the system
 *
 * @author maxence
 */
@Path("monitoring")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class MonitoringController {

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
}
