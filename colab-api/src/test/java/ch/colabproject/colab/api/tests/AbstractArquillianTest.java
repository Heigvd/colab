/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.tests;

import ch.colabproject.colab.api.ejb.RequestManager;
import ch.colabproject.colab.api.rest.ProjectController;
import ch.colabproject.colab.api.rest.UserController;
import ch.colabproject.colab.api.security.HttpSession;
import java.io.File;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Level;
import javax.annotation.Resource;
import javax.inject.Inject;
import javax.sql.DataSource;
import org.eu.ingwar.tools.arquillian.extension.suite.annotations.ArquillianSuiteDeployment;
import org.jboss.arquillian.container.test.api.Deployment;
import org.jboss.arquillian.junit5.ArquillianExtension;
import org.jboss.shrinkwrap.api.ShrinkWrap;
import org.jboss.shrinkwrap.api.importer.ExplodedImporter;
import org.jboss.shrinkwrap.api.spec.JavaArchive;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Root class for Arquillian Based test.
 * <p>
 * Arquillian boot EE application for testing purpose
 *
 * @author maxence
 */
@ExtendWith(ArquillianExtension.class)
@ArquillianSuiteDeployment
public abstract class AbstractArquillianTest {

    protected static final Logger logger = LoggerFactory.getLogger(AbstractArquillianTest.class);

    /**
     * Provide project logic
     */
    @Inject
    protected ProjectController projectController;

    @Inject
    protected UserController userController;

    @Inject
    protected RequestManager requestManager;

    @Resource(lookup = "java:global/colabDS")
    private DataSource colabDataSource;

    @Deployment
    public static JavaArchive createDeployement() {
        JavaArchive war = ShrinkWrap.create(JavaArchive.class)
            .as(ExplodedImporter.class)
            .importDirectory(new File("target/classes/"))
            .importDirectory(new File("target/test-classes/"))
            .as(JavaArchive.class);
        //.addAsManifestResource(EmptyAsset.INSTANCE, "beans.xml");

        //war.addPackages(true, "com.wegas");
        //war.addAsDirectory("target/embed-classes/");
        //war.addAsResource("./src/test/resources/META-INF/persistence.xml", "META-INF/persistence.xml");
        //logger.error("MyWegasArchive: {}", war.toString(true));

        /* Log Levels */
        java.util.logging.Logger.getLogger("javax.enterprise.system.tools.deployment")
            .setLevel(Level.WARNING);
        java.util.logging.Logger.getLogger("javax.enterprise.system").setLevel(Level.FINE);
        //java.util.logging.Logger.getLogger("javax.enterprise.system.core").setLevel(Level.FINE);
        java.util.logging.Logger.getLogger("fish.payara.nucleus.healthcheck").setLevel(Level.SEVERE);
        org.glassfish.ejb.LogFacade.getLogger().setLevel(Level.SEVERE);

        return war;
    }

    /**
     * ran once
     */
    @BeforeAll
    public static void initGlobal() {
        /* no-op */
    }

    /**
     * Timestamp: start of beforeEach int method
     */
    private long startTime;

    /**
     * Timestamp: end of beforeEach int method
     */
    private long initTime;

    /**
     * Clear and init database
     */
    protected void resetDatabase() {
        clearDatabase();
        initDatabase();
    }

    /**
     * delete all records from database
     */
    protected void clearDatabase() {
        String sql = "DO\n"
            + "$func$\n"
            + "BEGIN \n"
            + "   EXECUTE\n"
            + "  (SELECT 'TRUNCATE TABLE '\n"
            + "       || string_agg(quote_ident(schemaname) || '.' || quote_ident(tablename), ', ')\n"
            + "       || ' CASCADE'\n"
            + "   FROM   pg_tables\n"
            + "   WHERE  (schemaname = 'public'\n"
            + "       AND tablename <> 'sequence')\n"
            + "   );\n"
            + "END\n"
            + "$func$;";

        try (Connection connection = colabDataSource.getConnection();
             Statement st = connection.createStatement()) {
            st.execute(sql);
        } catch (SQLException ex) {
            logger.error("Table reset (SQL: " + sql + ")", ex);
        }
    }

    /**
     * Insert minimal required data in test database; TODO
     */
    protected void initDatabase() {
        // TODO
    }

    /**
     * Before each step: reset db state
     *
     * @param info Jupiter Test info
     */
    @BeforeEach
    public void init(TestInfo info) {
        if (requestManager != null) {
            // mock http session
            logger.info("Start TEST {}", info.getDisplayName());
            this.startTime = System.currentTimeMillis();

            HttpSession httpSession = new HttpSession();
            httpSession.setSessionId("MOCK-HTTP-SESSION");
            requestManager.setHttpSession(httpSession);

            // start each test with a clean database
            resetDatabase();
            this.initTime = System.currentTimeMillis();
        }
    }

    /**
     * Perform some cleanup and log duration. Note that db is clear before each test, thus, it's not
     * necessary to clear data here
     *
     * @param info jupiter test info
     */
    @AfterEach
    public void clean(TestInfo info) {
        if (requestManager != null) {
            long now = System.currentTimeMillis();
            logger.info("TEST {} DURATION: total: {} ms; init: {} ms; test: {} ms",
                info.getDisplayName(),
                now - this.startTime,
                this.initTime - this.startTime,
                now - this.initTime);
        }
    }

}
