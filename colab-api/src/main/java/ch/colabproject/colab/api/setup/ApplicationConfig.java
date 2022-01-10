/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.setup;

import javax.ws.rs.ApplicationPath;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;

/**
 * Simple REST WebService application.
 *
 * @author maxence
 */
@ApplicationPath("api")
public class ApplicationConfig extends ResourceConfig {

    /**
     * Create and init REST application
     */
    public ApplicationConfig() {
        // Implemetation dependent feature needs implementation dependent ResourceConfig application
        register(MultiPartFeature.class);

        // Scan packages to find endpoints
        packages("ch.colabproject.colab.api");
    }
}
