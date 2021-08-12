/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.WithPermission;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.security.permissions.Conditions.Condition;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * To check access rights.
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class SecurityFacade {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(SecurityFacade.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * As check are done against current authenticated user, we need access to the requestManager:
     */
    @Inject
    private RequestManager requestManager;

    /**
     * Get the current user if it exists.
     *
     * @return the current user
     *
     * @throws HttpErrorMessage authRequired if currentUser is not authenticated
     */
    public User assertAndGetCurrentUser() {
        User user = requestManager.getCurrentUser();
        if (user != null) {
            return user;
        } else {
            throw HttpErrorMessage.authenticationRequired();
        }
    }

    /**
     * Assert the given condition is true
     *
     * @param condition the condition to check
     * @param message   message to log in case the assertion failed
     *
     * @throws HttpErrorMessage <ul>
     * <li>with authenticationRequired if assertion fails and current user is not authenticated;
     * <li>with forbidden if the authenticated user does not have enough permission
     * </ul>
     */
    public void assertCondition(Condition condition, String message) {
        if (!requestManager.isAdmin() && !condition.eval(requestManager, em)) {
            logger.error(message);
            if (requestManager.isAuthenticated()) {
                throw HttpErrorMessage.forbidden();
            } else {
                throw HttpErrorMessage.authenticationRequired();
            }
        }
    }

    /**
     * Assert the given condition is true.If the current user is an admin, this assertion will never
     * fail
     *
     * @param condition the condition to evaluate
     *
     * @throws HttpErrorMessage <li>with authenticationRequired if assertion fails and current user
     *                          is not authenticated; <li>with forbidden if the authenticated user
     *                          does not have enough permission
     */
    private void assertCondition(Condition condition, String message, WithPermission o) {
        if (!requestManager.isAdmin() && !condition.eval(requestManager, em)) {
            logger.error("{} Permission denied: {} ({}) currentUser: {}", message, o, condition, requestManager.getCurrentUser());
            if (requestManager.isAuthenticated()) {
                throw HttpErrorMessage.forbidden();
            } else {
                throw HttpErrorMessage.authenticationRequired();
            }
        }
    }

    /**
     * Assert the currentUser has right to create the given object
     *
     * @param o object the user want to create
     */
    public void assertCreatePermission(WithPermission o) {
        this.assertCondition(o.getCreateCondition(), "Create", o);
    }

    /**
     * Assert the currentUser has right to read the given object
     *
     * @param o object the user want to read
     */
    public void assertReadPermission(WithPermission o) {
        this.assertCondition(o.getReadCondition(), "Read", o);
    }

    /**
     * Assert the currentUser has right to update the given object
     *
     * @param o object the user want to update
     */
    public void assertUpdatePermission(WithPermission o) {
        this.assertCondition(o.getUpdateCondition(), "Update", o);
    }

    /**
     * Assert the currentUser has right to update the given object
     *
     * @param o object the user want to delete
     */
    public void assertDeletePermission(WithPermission o) {
        this.assertCondition(o.getDeleteCondition(), "Delete", o);
    }
}
