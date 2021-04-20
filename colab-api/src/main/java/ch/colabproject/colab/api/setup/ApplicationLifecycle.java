/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.setup;

import ch.colabproject.colab.api.ejb.ApplicationLifecycleFacade;
import ch.colabproject.colab.api.ejb.CdiBridgeSingleton;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import javax.inject.Inject;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author maxence
 */
@WebServlet(loadOnStartup = 2)
public class ApplicationLifecycle extends HttpServlet {

    private static final long serialVersionUID = 1L;

    /**
     * Logger. Default level, set in logback.xml, is INFO
     */
    private static final Logger logger = LoggerFactory.getLogger(ApplicationLifecycle.class);

    /**
     * User related methods
     */
    @Inject
    private ApplicationLifecycleFacade applicationLifecycleFacade;

    /**
     * CDI bridge
     */
    @Inject
    private CdiBridgeSingleton cdiBridgeSingleton;

    /**
     * Initialize application
     *
     * @param config servlet config
     *
     * @exception ServletException if an exception occurs that interrupts the servlet's normal
     *                             operation
     */
    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        logger.info("Initialize Application");

        logger.info("Initialize Bridge Singleton");
        cdiBridgeSingleton.init();

        // make sure the PolymoorphicDeserializer known all entities defined in
        // the ch.colabproject.colab.api package
        int newTypeCount = PolymorphicDeserializer.includePackage("ch.colabproject.colab.api");
        logger.info("Update PolymorphicDeserializer: {} new types", newTypeCount);

        logger.info("Create a default admin user if none exists");
        applicationLifecycleFacade.createDefaultAdminIfNone();
    }

    @Override
    public void destroy() {
        super.destroy();
        logger.trace("LIFE CYCLE : destroy");
    }
}
