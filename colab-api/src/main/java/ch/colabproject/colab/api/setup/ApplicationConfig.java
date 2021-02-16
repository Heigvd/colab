/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.setup;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

/**
 * Simple REST WebService application.
 *
 * @author maxence
 */
@ApplicationPath("api")
public class ApplicationConfig extends Application {
    /* no-op : declarative configuration */
}
