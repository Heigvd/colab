/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.WithPermission;
import ch.colabproject.colab.api.model.team.acl.InvolvementLevel;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.security.permissions.Conditions.Condition;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
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
     * As check are done against current authenticated user, we need access to the requestManager:
     */
    @Inject
    private RequestManager requestManager;

    /**
     * To check membership-ness
     */
    @Inject
    private TeamFacade teamFacade;

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
        if (!requestManager.isAdmin() && !condition.eval(requestManager, this)) {
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
        if (!requestManager.isAdmin() && !condition.eval(requestManager, this)) {
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

    /**
     * Are two user teammate?
     *
     * @param a a user
     * @param b another user
     *
     * @return true if both user are both member of the same team
     */
    public boolean areUserTeammate(User a, User b) {
        return teamFacade.areUserTeammate(a, b);
    }

    /**
     * Has the current user readwrite access to the
     *
     * @param card
     * @param member
     *
     * @return
     */
    public boolean hasReadWriteAccess(Card card) {
        User currentUser = requestManager.getCurrentUser();
        if (card == null || currentUser == null) {
            return false;
        }
        TeamMember member = teamFacade.findMemberByUserAndProject(card.getProject(), currentUser);
        return member != null && (member.getPosition() == HierarchicalPosition.OWNER
            || teamFacade.getEffectiveInvolvementLevel(card, member).isRw());
    }

    /**
     * Has the current user the right to read the given card ?
     *
     * @param card   the card to read
     * @param member
     *
     * @return
     */
    public boolean hasReadAccess(Card card) {

        User currentUser = requestManager.getCurrentUser();
        if (card == null || currentUser == null) {
            return false;
        }
        TeamMember member = teamFacade.findMemberByUserAndProject(card.getProject(), currentUser);
        return member != null && (member.getPosition() == HierarchicalPosition.OWNER
            || teamFacade.getEffectiveInvolvementLevel(card, member)
            != InvolvementLevel.OUT_OF_THE_LOOP);
    }

    /**
     * Is the current user member of the team of the given project?
     *
     * @param project the project
     *
     * @return true if the user if member of the project team
     */
    public boolean isCurrentUserMemberOfTheProjectTeam(Project project) {
        User currentUser = requestManager.getCurrentUser();
        if (project == null || currentUser == null) {
            return false;
        }
        TeamMember member = teamFacade.findMemberByUserAndProject(project, currentUser);
        return member != null;
    }

    /**
     * Is the current user the project owner ?
     *
     * @param project the project
     *
     * @return true if the current user is owner of the project
     */
    public boolean isCurrentUserOwnerOfTheProject(Project project) {
        User currentUser = requestManager.getCurrentUser();
        if (project == null || currentUser == null) {
            return false;
        }
        TeamMember member = teamFacade.findMemberByUserAndProject(project, currentUser);
        return member != null && member.getPosition() == HierarchicalPosition.OWNER;
    }

    /**
     * Is the current user the project leader?
     *
     * @param project the project
     *
     * @return true if the current user is owner of the project
     */
    public boolean isCurrentUserLeaderOfTheProject(Project project) {
        User currentUser = requestManager.getCurrentUser();
        if (project == null || currentUser == null) {
            return false;
        }
        TeamMember member = teamFacade.findMemberByUserAndProject(project, currentUser);
        return member != null && (member.getPosition() == HierarchicalPosition.OWNER
            || member.getPosition() == HierarchicalPosition.LEAD);
    }

    /**
     * Is the current user intern to the project team?
     *
     * @param project the project
     *
     * @return true if the current user is intern to the project
     */
    public boolean isCurrentUserInternToProject(Project project) {
        User currentUser = requestManager.getCurrentUser();
        if (project == null || currentUser == null) {
            return false;
        }
        TeamMember member = teamFacade.findMemberByUserAndProject(project, currentUser);
        return member != null && member.getPosition() != HierarchicalPosition.EXTERN;
    }
}
