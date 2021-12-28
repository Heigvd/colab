/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.tests;

import ch.colabproject.colab.api.setup.LiquibaseProducer;
import javax.annotation.Resource;
import javax.enterprise.inject.Produces;
import javax.enterprise.inject.Specializes;
import javax.sql.DataSource;
import liquibase.integration.cdi.CDILiquibaseConfig;
import liquibase.integration.cdi.annotations.LiquibaseType;
import liquibase.resource.ClassLoaderResourceAccessor;
import liquibase.resource.ResourceAccessor;

/**
 * Override default Producer as we do not want to use liquibase in test env
 *
 * @author maxence
 */
public class LiquibaseTestProducer extends LiquibaseProducer {

    /**
     * SQL Datasource
     */
    @Resource(lookup = "java:global/colabDS")
    private DataSource myDataSource;

    /**
     * Liquibase configuration which indicates liquibase should not run
     *
     * @return the config
     */
    @Produces
    @LiquibaseType
    @Specializes
    public CDILiquibaseConfig createConfig() {
        CDILiquibaseConfig config = new CDILiquibaseConfig();
        config.setShouldRun(false);
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
    @Specializes
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
    @Specializes
    public ResourceAccessor create() {
        return new ClassLoaderResourceAccessor(getClass().getClassLoader());
    }

}
