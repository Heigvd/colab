/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.setup;

import javax.annotation.Resource;
import javax.enterprise.inject.Produces;
import javax.sql.DataSource;
import liquibase.integration.cdi.CDILiquibaseConfig;
import liquibase.integration.cdi.annotations.LiquibaseType;
import liquibase.resource.ClassLoaderResourceAccessor;
import liquibase.resource.ResourceAccessor;

/**
 * LiquiBase Singleton. To manage database migrations.
 *
 * DB Migration is not enable for the time. We'll wait for a first stable version of the model
 *
 * Morover it seems there is an issue setting the Liquibase config with such CDI injections
 * when used within arquillian containers...
 *
 * We may want to setup a liquibase servlet in web.xml to replace this
 *
 * @author maxence
 */
public class LiquibaseProducer {

    /**
     * SQL Datasource
     */
    @Resource(lookup = "java:global/colabDS")
    private DataSource myDataSource;

    /**
     * Liquibase configuration
     *
     * @return the config
     */
    @Produces
    @LiquibaseType
    public CDILiquibaseConfig createConfig() {
        CDILiquibaseConfig config = new CDILiquibaseConfig();
        config.setChangeLog("/META-INF/db.changelog.xml");
        return config;
    }

    /**
     * Give liquibase access to the datasource
     *
     * @return the datasource
     *
     */
    @Produces
    @LiquibaseType
    public DataSource createDataSource() {
        return myDataSource;
    }

    /**
     * Give liquibase access to our classloader
     *
     * @return the classloader
     */
    @Produces
    @LiquibaseType
    public ResourceAccessor create() {
        return new ClassLoaderResourceAccessor(getClass().getClassLoader());
    }

}
