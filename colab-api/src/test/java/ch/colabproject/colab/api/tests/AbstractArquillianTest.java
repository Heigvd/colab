/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.tests;

import ch.colabproject.colab.api.ejb.ProjectFacade;
import java.io.File;
import java.util.logging.Level;
import javax.inject.Inject;
import org.jboss.arquillian.container.test.api.Deployment;
import org.jboss.arquillian.junit5.ArquillianExtension;
import org.jboss.shrinkwrap.api.ShrinkWrap;
import org.jboss.shrinkwrap.api.importer.ExplodedImporter;
import org.jboss.shrinkwrap.api.spec.JavaArchive;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;

/**
 * Root class for Arquillian Based test.
 * <p>
 * Arquillian boot EE application for testing purpose
 *
 * @author maxence
 */
@ExtendWith(ArquillianExtension.class)
public abstract class AbstractArquillianTest {

    /**
     * Provide project logic
     */
    @Inject
    protected ProjectFacade projectFacade;

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
        java.util.logging.Logger.getLogger("javax.enterprise.system.tools.deployment").setLevel(Level.WARNING);
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
    public static void initJCR() {
        /* no-op */
    }

    /**
     * Before each step: reset db state
     */
    @BeforeEach
    public void init() {
        /* no-op */
    }

}
