/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.tests;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.exceptions.ColabErrorMessage;
import ch.colabproject.colab.api.model.user.AuthInfo;
import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.SignUpInfo;
import ch.colabproject.colab.api.rest.ProjectController;
import java.io.File;
import java.net.URL;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Level;
import javax.annotation.Resource;
import javax.inject.Inject;
import javax.sql.DataSource;
import javax.ws.rs.ClientErrorException;
import org.eu.ingwar.tools.arquillian.extension.suite.annotations.ArquillianSuiteDeployment;
import org.jboss.arquillian.container.test.api.Deployment;
import org.jboss.arquillian.junit5.ArquillianExtension;
import org.jboss.arquillian.test.api.ArquillianResource;
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
    private ProjectController projectController;

    //@Inject
    //protected UserController userController;
    //@Inject
    //protected RequestManager requestManager;
    @Resource(lookup = "java:global/colabDS")
    private DataSource colabDataSource;

    @ArquillianResource
    private URL deploymentURL;

    /**
     * REST client to use to call REST method
     */
    protected ColabRestClient client;

    /**
     * Timestamp: start of beforeEach int method
     */
    private long startTime;

    /**
     * Timestamp: end of beforeEach int method
     */
    private long initTime;

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
            + "EXECUTE (\n"
            + "  SELECT 'TRUNCATE TABLE '\n"
            + "    || string_agg(quote_ident(schemaname) || '.' || quote_ident(tablename), ', ')\n"
            + "    || ' CASCADE'\n"
            + "  FROM   pg_tables\n"
            + "  WHERE  (schemaname = 'public'\n"
            + "          AND tablename <> 'sequence')\n"
            + ");\n"
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
     * Create a new localAccount with given identifier and credential
     *
     * @param username username
     * @param email    address to use as identifier
     * @param password plain text password
     *
     * @return a user who can login with {@link #signIn(TestUser) signIn}
     *
     * @throws ColabErrorMessage if something went wrong
     */
    protected TestUser signup(String username, String email, String password)
        throws ClientErrorException {
        // Create a brand new user with a local account
        AuthMethod authMethod = client.getAuthMethod(email);

        SignUpInfo signup = new SignUpInfo();
        signup.setUsername(username);
        signup.setEmail(email);
        signup.setSalt(authMethod.getSalt());
        signup.setHashMethod(authMethod.getMandatoryMethod());

        String hash = Helper.bytesToHex(
            authMethod.getMandatoryMethod().hash(
                password, signup.getSalt()
            )
        );

        signup.setHash(hash);

        client.signUp(signup);

        return new TestUser(username, email, password);
    }

    /**
     * Sign the given test user in
     *
     * @param user user to sign in
     *
     * @throws ClientErrorException if authentication fails
     */
    protected void signIn(TestUser user) throws ClientErrorException {
        AuthInfo authInfo = new AuthInfo();
        authInfo.setEmail(user.getEmail());

        AuthMethod authMethod = client.getAuthMethod(user.getEmail());

        // compute mandatory hash
        String hash = Helper.bytesToHex(
            authMethod.getMandatoryMethod().hash(
                user.getPassword(),
                authMethod.getSalt()
            )
        );
        authInfo.setMandatoryHash(hash);

        if (authMethod.getOptionalMethod() != null) {
            // method rotation is requested : computes hash with new method too
            authInfo.setOptionalHash(
                Helper.bytesToHex(
                    authMethod.getOptionalMethod().hash(
                        user.getPassword(),
                        authMethod.getNewSalt()
                    )
                )
            );
        }

        client.signIn(authInfo);
    }

    /**
     * Sign the current user out
     */
    protected void signOut() {
        client.signOut();
    }

    /**
     * Insert minimal required data in test database; TODO
     */
    protected void initDatabase() {
        // TODO
    }

    /**
     * ran once
     */
    @BeforeAll
    public static void initGlobal() {
        /* no-op */
    }

    /**
     * Before each step: reset db state
     *
     * @param info Jupiter Test info
     */
    @BeforeEach
    public void init(TestInfo info) {
        if (projectController != null) {
            this.client = new ColabRestClient(deploymentURL.toString());
            logger.info("Start TEST {}", info.getDisplayName());
            this.startTime = System.currentTimeMillis();

            // mock http session
            //HttpSession httpSession = new HttpSession();
            //httpSession.setSessionId("MOCK-HTTP-SESSION");
            //requestManager.setHttpSession(httpSession);
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
        if (projectController != null) {
            long now = System.currentTimeMillis();
            logger.info("TEST {} DURATION: total: {} ms; init: {} ms; test: {} ms",
                info.getDisplayName(),
                now - this.startTime,
                this.initTime - this.startTime,
                now - this.initTime);
        }
    }

}
