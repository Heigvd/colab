/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.setup;

import javax.annotation.sql.DataSourceDefinition;
import javax.ejb.Stateless;
import org.postgresql.xa.PGXADataSource;

/**
 * Provides data source definition
 *
 * @author maxence
 */
@Stateless
@DataSourceDefinition(
    name = "java:global/colabDS",
    className = "org.postgresql.xa.PGXADataSource",
    //serverName = "${colab.database.host:-localhost}",
    //portNumber = 5432,//how to interpolate variable properties to int ?
    //databaseName = "${colab.database.name}",
    user = "${colab.database.user}",
    password = "${colab.database.password}",
    url = "jdbc:postgresql://${colab.database.host}:${colab.database.port}/${colab.database.name}"
)
public class DataSourceDefinitionProvider {

    /**
     * Dummy method which do nothin. Nonetheless, setting return type to PGXADataSource asserts the
     * class is on the class-path
     *
     * @return the PGXADatasSurce class
     */
    public Class<? extends PGXADataSource> loadDep() {
        return PGXADataSource.class;
    }
}
