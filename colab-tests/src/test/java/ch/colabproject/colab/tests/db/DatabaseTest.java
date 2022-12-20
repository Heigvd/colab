/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.db;

import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.DatabaseTools;
import java.sql.SQLException;
import jakarta.annotation.Resource;
import javax.sql.DataSource;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Assert JPA create the database well.
 *
 * @author maxence
 */
public class DatabaseTest extends AbstractArquillianTest {

    /**
     * SQL Datasource
     */
    @Resource(lookup = "java:global/colabDS")
    private DataSource ds;

    /**
     * One should index all foreign keys.
     * @throws java.sql.SQLException if any errors occurs
     */
    @Test
    public void testIndexes() throws SQLException {
        Assertions.assertEquals(0, DatabaseTools.getMissingIndexesCount(ds),
            "Some indexes are missing. Please create them with JPA and LiquiBase See log for details");
    }
}
