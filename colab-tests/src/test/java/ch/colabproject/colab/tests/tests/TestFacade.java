/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.tests;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.user.UserManager;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;

/**
 *
 * Some enterprise method for testing purpose
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class TestFacade {

    /**
     * Provide user management internal logic
     */
    @Inject
    private UserManager userManager;

    @Inject
    private RequestManager requestManager;

    /**
     * Hack to give admin right to anybody without required rights. This hash is only available
     * within the test scope
     *
     * @param id id of user who will became an admin
     */
    public void grantAdminRight(Long id) {
        requestManager.sudo(() -> userManager.grantAdminRight(id));
    }
}
