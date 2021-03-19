/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;

/**
 * To check access rights.
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class SecurityFacade {

    /**
     * As check are done against current authenticated user, we need access to the requestManager:
     */
    @Inject
    private RequestManager requestManager;

    /**
     * Is the current authenticated user an administrator ?
     *
     * @return true if the current authenticate is an admin, false otherwise
     */
    public boolean isAdmin() {
        if (requestManager.isAuthenticated()) {
            return requestManager.getCurrentUser().isAdmin();
        }
        return false;
    }

    /**
     * Is the current authenticated user the given one ?
     *
     * @param user user to check current user against
     *
     * @return true if the current user equals given one
     */
    public boolean isUser(User user) {
        if (user != null && requestManager.isAuthenticated()) {
            return user.equals(requestManager.getCurrentUser());
        }
        return false;
    }

    /**
     * Assert the current user has write access to the given user
     *
     * @param user user the currentUser want to edit
     *
     * @throws HttpErrorMessage bad request if user id null; authRequired if currentUser is not
     *                          authenticated; forbidden if current user is authenticated but has
     *                          not right to edit given user
     *
     */
    public void assertCanWrite(User user) {
        if (user == null) {
            throw HttpErrorMessage.badRequest();
        } else {
            User currentUser = requestManager.getCurrentUser();
            if (currentUser == null) {
                throw HttpErrorMessage.authenticationRequired();
            } else {
                if (!currentUser.isAdmin() && !currentUser.equals(user)) {
                    throw HttpErrorMessage.forbidden();
                }
            }
        }
    }
}
