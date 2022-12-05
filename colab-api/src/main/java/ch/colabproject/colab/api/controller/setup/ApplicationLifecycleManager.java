/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.setup;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.user.UserManager;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import ch.colabproject.colab.api.setup.ColabConfiguration;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Some business method required by {@link ApplicationLifecycleManager}.
 * <p>
 * This is a required step. Without this step, beans injection and CCI context are quite messed up.
 * <p>
 * This beans shall only call methods with annotation {@link javax.ejb.TransactionAttribute} set to
 * {@link javax.ejb.TransactionAttributeType#REQUIRES_NEW}.
 * <p>
 * @author maxence
 */
@Stateless
@LocalBean
public class ApplicationLifecycleManager {

    /**
     * Logger. Default level, set in logback.xml, is INFO
     */
    private static final Logger logger = LoggerFactory.getLogger(ApplicationLifecycleManager.class);

    /**
     * User persistence
     */
    @Inject
    private UserDao userDao;

    /**
     * User management
     */
    @Inject
    private UserManager userManager;

    /**
     * request manager
     */
    @Inject
    private RequestManager requestManager;

    /**
     * Create a default admin user if there is no admin at all.
     */
    public void createDefaultAdminIfNone() {
        requestManager.sudo(() -> {
            if (userDao.findAllAdmin().isEmpty()) {
                try {
                    logger.info("No admin exists, create one");
                    //make sure to create the user within a brand new transaction
                    User admin = userManager.createAdminUserTx(
                        ColabConfiguration.getDefaultAdminUsername(),
                        ColabConfiguration.getDefaultAdminEmail(),
                        ColabConfiguration.getDefaultAdminPassword()
                    );
                    logger.info("New admin user: {}", admin);
                } catch (HttpErrorMessage ex) {
                    logger.error(
                        "Fails to create default admin user. Does non-admin user exist with same username or email address");
                } catch (RuntimeException ex) {
                    logger.error(
                        "Fails to create default amdin user for some unknown reason. Please check config",
                        ex);
                }
            }
        });
    }
}
