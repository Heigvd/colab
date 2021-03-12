/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.setup;

import ch.colabproject.colab.api.ejb.UserManagement;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.api.model.user.User;
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
     * Logger.Default level, set in logback.xml, is INFO
     */
    private static final Logger logger = LoggerFactory.getLogger(ApplicationLifecycle.class);

    /**
     * User related methods
     */
    @Inject
    private UserManagement userManagement;

    /**
     * Create a default admin user if there is no admin at all
     */
    private void createDefaultAdminIfNone() {
        if (userManagement.findAllAdmin().isEmpty()) {
            try {
                logger.info("Create default admin user");
                User admin = userManagement.createUser(
                    ColabConfiguration.getDefaultAdminUsername(),
                    ColabConfiguration.getDefaultAdminEmail(),
                    ColabConfiguration.getDefaultAdminPassword()
                );
                userManagement.grantAdminRight(admin.getId());
            } catch (HttpErrorMessage ex) {
                logger.error("Fails to create default amdin user. "
                    + "Does non-admin user exists with same username or email address");
            } catch (RuntimeException ex) {
                logger.error("Fails to create default amdin user for some unknown reason."
                    + " Please check config");
            }
        }
    }

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        logger.trace("LIFE CYCLE : init");
        createDefaultAdminIfNone();
    }

    @Override
    public void destroy() {
        super.destroy();
        logger.trace("LIFE CYCLE : destroy");
    }
}
