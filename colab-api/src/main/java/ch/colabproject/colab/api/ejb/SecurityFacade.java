/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

/**
 * To check access rights.
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class SecurityFacade {

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

    /**
     * Assert the current user has read access to the given user
     *
     * @param user user the currentUser want to read
     *
     * @throws HttpErrorMessage bad request if user id null; authRequired if currentUser is not
     *                          authenticated; forbidden if current user is authenticated but has
     *                          not right to read given user
     *
     */
    public void assertCanRead(User user) {
        if (user == null) {
            throw HttpErrorMessage.badRequest();
        } else {
            User currentUser = requestManager.getCurrentUser();
            if (currentUser == null) {
                throw HttpErrorMessage.authenticationRequired();
            } else {

                if (this.areUserTeammate(currentUser, user)) {
                    throw HttpErrorMessage.forbidden();
                }
            }
        }
    }

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
     * Check if the user is member of the team of the project.
     *
     * @param user    a user
     * @param project a project
     *
     * @return true if the user is member of the project
     */
    public boolean isUserMemebrOfProject(User user, Project project) {
        if (user != null && project != null) {
            return project.getTeamMembers().stream()
                .filter(member -> user.equals(member.getUser()))
                .findFirst().isPresent();
        }
        return false;
    }

    /**
     * Check is user have at least one common team
     *
     * @param a a user
     * @param b other user
     *
     * @return true if both users are member of the same team
     */
    public boolean areUserTeammate(User a, User b) {
        TypedQuery<Boolean> query = em.createNamedQuery("TeamMember.areUserTeammate", Boolean.class);
        query.setParameter("aId", a.getId());
        query.setParameter("bId", b.getId());

        // if the query returns something, users are teammates
        return !query.getResultList().isEmpty();
    }

    /**
     * Make sure the current user has right to edit the project
     *
     * @param project project to edit
     *
     * @throws HttpErrorMessage forbidden
     */
    public void assertProjectWriteRight(Project project) {
        User currentUser = assertAndGetCurrentUser();
        if (!currentUser.isAdmin() && !this.isUserMemebrOfProject(currentUser, project)) {
            throw HttpErrorMessage.forbidden();
        }
    }

    /**
     * Make sure the current user has right to edit the project
     *
     * @param project project to edit
     *
     * @throws HttpErrorMessage forbidden
     */
    public void assertIsMember(Project project) {
        User currentUser = assertAndGetCurrentUser();
        if (!this.isUserMemebrOfProject(currentUser, project)) {
            throw HttpErrorMessage.forbidden();
        }
    }
}
