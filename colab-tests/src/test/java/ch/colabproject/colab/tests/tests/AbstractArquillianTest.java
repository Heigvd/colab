/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.tests;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.ejb.UserManagement;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.token.Token;
import ch.colabproject.colab.api.model.token.VerifyLocalAccountToken;
import ch.colabproject.colab.api.model.user.AuthInfo;
import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.SignUpInfo;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.user.UserDao;
import ch.colabproject.colab.client.ColabClient;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.tools.JsonbProvider;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import ch.colabproject.colab.tests.mailhog.MailhogClient;
import ch.colabproject.colab.tests.mailhog.model.Message;
import ch.colabproject.colab.tests.ws.WebsocketClient;
import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.sql.DataSource;
import javax.websocket.DeploymentException;
import javax.ws.rs.ClientErrorException;
import org.eu.ingwar.tools.arquillian.extension.suite.annotations.ArquillianSuiteDeployment;
import org.jboss.arquillian.container.test.api.Deployment;
import org.jboss.arquillian.junit5.ArquillianExtension;
import org.jboss.arquillian.test.api.ArquillianResource;
import org.jboss.shrinkwrap.api.ShrinkWrap;
import org.jboss.shrinkwrap.api.importer.ExplodedImporter;
import org.jboss.shrinkwrap.api.spec.JavaArchive;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;
import org.junit.jupiter.api.extension.ExtendWith;
import org.reflections.Reflections;
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

    /**
     * Logger
     */
    protected static final Logger logger = LoggerFactory.getLogger(AbstractArquillianTest.class);

    /**
     * Provide one-stop-shop reflections object
     */
    protected static final Reflections reflections;

    private boolean hasDbBeenInitialized = false;

    static {
        reflections = new Reflections("ch.colabproject.colab");
    }

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Provide user management internal logic
     */
    @Inject
    private UserManagement userManagement;

    /**
     * User persistence
     */
    @Inject
    private UserDao userDao;

    /**
     * Direct db access allows to clear data before each test
     */
    @Resource(lookup = "java:global/colabDS")
    private DataSource colabDataSource;

    /**
     * URL to reach application
     */
    @ArquillianResource
    protected URL deploymentURL;

    /**
     * REST client to use to call co.LAB REST methods
     */
    protected ColabClient client;

    /**
     * List of created clients. This list is populated by {@link #createWsClient() } and cleared by
     * {@link #clean(org.junit.jupiter.api.TestInfo) @AfterEach} callback
     */
    private final List<WebsocketClient> wsClients = new ArrayList<>();

    /**
     * REST client to use to call REST methods
     */
    protected MailhogClient mailClient;

    /**
     * Timestamp: start of beforeEach int method
     */
    private long startTime;

    /**
     * Timestamp: end of beforeEach int method
     */
    private long initTime;

    /**
     * Admin user available to each test
     */
    protected TestUser admin;

    /**
     * Id of the admin user
     */
    protected Long adminUserId;

    /**
     * Create deployment
     *
     * @return the war
     */
    @Deployment
    public static JavaArchive createDeployement() {
        JavaArchive war = ShrinkWrap.create(JavaArchive.class)
            .as(ExplodedImporter.class)
            .importDirectory(new File("../colab-api/target/classes/"))
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
     *
     * @throws SQLException something went wrong
     */
    protected void resetDatabase() throws SQLException {
//        em.flush();
//        em.clear();
        em.getEntityManagerFactory().getCache().evictAll();
        DatabaseTools.clearDatabase(colabDataSource);
        initDatabase();
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
     * @throws HttpErrorMessage if something went wrong
     */
    protected TestUser signup(String username, String email, String password)
        throws ClientErrorException {
        // Create a brand new user with a local account
        AuthMethod authMethod = client.userRestEndpoint.getAuthMethod(email);

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

        client.userRestEndpoint.signUp(signup);

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
        this.signIn(this.client, user);
    }

    protected void signIn(ColabClient client, TestUser user) {
        AuthInfo authInfo = getAuthInfo(user.getEmail(), user.getPassword());
        client.userRestEndpoint.signIn(authInfo);
    }

    /**
     * hash password
     *
     * @param identifier    email address or username
     * @param plainPassword plain-text password
     *
     * @return authinfo with hashed password
     */
    protected AuthInfo getAuthInfo(String identifier, String plainPassword) {
        AuthMethod authMethod = client.userRestEndpoint.getAuthMethod(identifier);
        AuthInfo authInfo = new AuthInfo();
        authInfo.setIdentifier(identifier);

        // compute mandatory hash
        String hash = Helper.bytesToHex(
            authMethod.getMandatoryMethod().hash(
                plainPassword,
                authMethod.getSalt()
            )
        );
        authInfo.setMandatoryHash(hash);

        if (authMethod.getOptionalMethod() != null) {
            // method rotation is requested : computes hash with new method too
            authInfo.setOptionalHash(
                Helper.bytesToHex(
                    authMethod.getOptionalMethod().hash(
                        plainPassword,
                        authMethod.getNewSalt()
                    )
                )
            );
        }

        return authInfo;
    }

    /**
     * Connect to mailhog and process all pending "Please verify your account" messages. Once
     * process, messages are deletes from mailhog.
     */
    protected void verifyAccounts() {
        mailClient.getMessages().forEach(message -> {
            List<String> headers = message.getContent().getHeaders().get("Subject");

            if (!headers.isEmpty()
                && VerifyLocalAccountToken.EMAIL_SUBJECT.equals(headers.get(0))) {
                Matcher matcher = TestHelper.extractToken(message);
                if (matcher.matches()) {
                    Long tokenId = Long.parseLong(matcher.group(1));
                    String plainToken = matcher.group(2);

                    Token token = client.tokenRestEndpoint.getToken(tokenId);
                    if (token instanceof VerifyLocalAccountToken) {
                        client.tokenRestEndpoint.consumeToken(tokenId, plainToken);
                        this.mailClient.deleteMessage(message.getId());
                    }
                }
            }
        });
    }


    /**
     * Sign the current user out
     */
    protected void signOut() {
        client.userRestEndpoint.signOut();
    }

    /**
     * Insert minimal required data in test database;
     *
     * @throws SQLException something went wrong
     */
    protected void initDatabase() throws SQLException {
        // make sure to have unpretictable IDs
        initDatabaseOnce();

        // TODO: setup initai dataset
    }

    /**
     * Setup initial dataset
     *
     * @throws SQLException something went wrong
     */
    protected void initDatabaseOnce() throws SQLException {
        if (!hasDbBeenInitialized) {
            hasDbBeenInitialized = true;
            logger.info("Randomize sequences");
            DatabaseTools.randomizeSequences(colabDataSource);
        }
    }

    /**
     * ran once
     */
    @BeforeAll
    public static void initGlobal() {
        /* no-op */
    }

    protected ColabClient createRestClient() {
        PolymorphicDeserializer.includePackage("ch.colabproject.colab.api");
        JsonbProvider jsonbProvider = new JsonbProvider();
        return new ColabClient(
            deploymentURL.toString(),
            "COLAB_SESSION_ID",
            JsonbProvider.getJsonb(),
            jsonbProvider
        );
    }

    protected WebsocketClient createWsClient() throws DeploymentException, IOException, InterruptedException, URISyntaxException {
        String httpProtocol = deploymentURL.getProtocol();
        String host = deploymentURL.getHost();
        int port = deploymentURL.getPort();
        String path = deploymentURL.getPath();
        String endpoint = (httpProtocol.equals("http") ? "ws" : "wss")
            + "://" + host + ":" + port + path + "ws";

        WebsocketClient wsClient = WebsocketClient.build(endpoint);
        this.wsClients.add(wsClient);
        return wsClient;
    }

    /**
     * Before each step: reset db state
     *
     * @param info Jupiter Test info
     *
     * @throws java.sql.SQLException if db initialization failed
     */
    @BeforeEach
    public void init(TestInfo info) throws SQLException {
        if (userManagement != null) {
            this.mailClient = new MailhogClient();
            try {
                mailClient.deleteAllMessages();
            } catch (Throwable ex) {
                logger.error("NO MAILHOG");
                Assertions.fail("No Mailhog ! did you \"docker run -d --restart always -p 8025:8025 -p 1025:1025 mailhog/mailhog\"?");
            }

            this.client = createRestClient();
            logger.info("Start TEST {}", info.getDisplayName());
            this.startTime = System.currentTimeMillis();

            // start each test with a clean database
            resetDatabase();

            // create one admin
            this.admin = this.signup("admin", "admin@colab.local", "MyPasswordIsSoSafe");

            verifyAccounts();

            User adminUser = userDao.findUserByUsername("admin");
            this.adminUserId = adminUser.getId();

            userManagement.grantAdminRight(adminUser.getId());

            signIn(admin);

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
        if (userManagement != null) {
            if (wsClients != null) {
                wsClients.forEach(wsClient -> {
                    try {
                        logger.info("Close websocket client {}", wsClient);
                        wsClient.close();
                    } catch (IOException ex) {
                        logger.warn("Failed to close websocket client");
                    }
                });
                wsClients.clear();
            }
            long now = System.currentTimeMillis();
            logger.info("TEST {} DURATION: total: {} ms; init: {} ms; test: {} ms",
                info.getDisplayName(),
                now - this.startTime,
                this.initTime - this.startTime,
                now - this.initTime);
        }
    }
}
