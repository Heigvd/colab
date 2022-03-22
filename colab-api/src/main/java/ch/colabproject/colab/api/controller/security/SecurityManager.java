/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.security;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.card.CardTypeManager;
import ch.colabproject.colab.api.controller.project.ProjectManager;
import ch.colabproject.colab.api.controller.team.TeamManager;
import ch.colabproject.colab.api.model.WithPermission;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.team.acl.InvolvementLevel;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.security.permissions.Conditions.Condition;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
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
public class SecurityManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(SecurityManager.class);

    /**
     * As check are done against current authenticated user, we need access to the requestManager:
     */
    @Inject
    private RequestManager requestManager;

    /**
     * To check membership-ness
     */
    @Inject
    private TeamManager teamManager;

    /**
     * Card type specific logic
     */
    @Inject
    private CardTypeManager cardTypeManager;

    /**
     * Project specific logic
     */
    @Inject
    private ProjectManager projectManager;

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
     * Mark the current request as {@link RequestManager#setInSecurityTx(boolean) in-security-tx}
     * and run the given action.
     *
     * @param action action to run
     */
    private void runInSecurityTx(Runnable action) {
        requestManager.setInSecurityTx(true);
        action.run();
        requestManager.setInSecurityTx(false);
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
    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public void assertConditionTx(Condition condition, String message) {
        runInSecurityTx(() -> this.assertCondition(condition, message, null));
    }

    /**
     * Assert the given condition is true. If the current user is an admin, this assertion will
     * never fail
     *
     * @param condition the condition to evaluate
     * @param message   message to display if the assertion failed
     * @param o         related object to log, may be null
     *
     * @throws HttpErrorMessage <ul>
     * <li>with authenticationRequired if assertion fails and current user is not authenticated;
     * <li>with forbidden if the authenticated user does not have enough permission
     * </ul>
     */
    private void assertCondition(Condition condition, String message, WithPermission o) {
        if (!requestManager.isAdmin()) {
            requestManager.sudo(() -> {
                if (!condition.eval(requestManager, this)) {
                    if (logger.isErrorEnabled()) {
                        if (o != null) {
                            logger.error("{} Permission denied: {} ({}) currentUser: {}",
                                message, o, condition, requestManager.getCurrentUser());
                        } else {
                            logger.error("{} Permission denied: ({}) currentUser: {}",
                                message, condition, requestManager.getCurrentUser());
                        }
                    }
                    if (requestManager.isAuthenticated()) {
                        throw HttpErrorMessage.forbidden();
                    } else {
                        throw HttpErrorMessage.authenticationRequired();
                    }
                }
            });
        }
    }

    /**
     * Assert the currentUser has right to create the given object
     *
     * @param o object the user want to create
     */
    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public void assertCreatePermissionTx(WithPermission o) {
        runInSecurityTx(() -> this.assertCreatePermission(o));
    }

    /**
     * Assert the currentUser has right to create the given object
     *
     * @param o object the user want to create
     */
    private void assertCreatePermission(WithPermission o) {
        this.assertCondition(o.getCreateCondition(), "Create", o);
    }

    /**
     * Assert the currentUser has right to read the given object
     *
     * @param o object the user want to read
     */
    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public void assertReadPermissionTx(WithPermission o) {
        runInSecurityTx(() -> this.assertReadPermission(o));
    }

    /**
     * Assert the currentUser has right to read the given object
     *
     * @param o object the user want to read
     */
    private void assertReadPermission(WithPermission o) {
        this.assertCondition(o.getReadCondition(), "Read", o);
    }

    /**
     * Assert the currentUser has right to update the given object
     *
     * @param o object the user want to update
     */
    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public void assertUpdatePermissionTx(WithPermission o) {
        runInSecurityTx(() -> this.assertUpdatePermission(o));
    }

    /**
     * Assert the currentUser has right to update the given object
     *
     * @param o object the user want to update
     */
    private void assertUpdatePermission(WithPermission o) {
        this.assertCondition(o.getUpdateCondition(), "Update", o);
    }

    /**
     * Assert the currentUser has right to update the given object
     *
     * @param o object the user want to delete
     */
    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public void assertDeletePermissionTx(WithPermission o) {
        runInSecurityTx(() -> this.assertDeletePermission(o));
    }

    /**
     * Assert the currentUser has right to update the given object
     *
     * @param o object the user want to delete
     */
    private void assertDeletePermission(WithPermission o) {
        this.assertCondition(o.getDeleteCondition(), "Delete", o);
    }

    /**
     * Are two user team mate?
     *
     * @param a a user
     * @param b another user
     *
     * @return true if both user are both member of the same team
     */
    public boolean areUserTeammate(User a, User b) {
        return teamManager.areUserTeammate(a, b);
    }

    /**
     * Has the current user read/write access to the given card
     *
     * @param card the card
     *
     * @return true if current user can write the card
     */
    public boolean hasReadWriteAccess(Card card) {
        User currentUser = requestManager.getCurrentUser();
        if (card == null || currentUser == null) {
            return false;
        }
        TeamMember member = teamManager.findMemberByUserAndProject(card.getProject(), currentUser);
        return member != null && (member.getPosition() == HierarchicalPosition.OWNER
            || teamManager.getEffectiveInvolvementLevel(card, member).isRw());
    }

    /**
     * Has the current user the right to read the given card ?
     *
     * @param card the card to read
     *
     * @return true if current user can read the card
     */
    public boolean hasReadAccess(Card card) {

        User currentUser = requestManager.getCurrentUser();
        if (card == null || currentUser == null) {
            return false;
        }
        TeamMember member = teamManager.findMemberByUserAndProject(card.getProject(), currentUser);
        return member != null && (member.getPosition() == HierarchicalPosition.OWNER
            || teamManager.getEffectiveInvolvementLevel(card, member)
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
        TeamMember member = teamManager.findMemberByUserAndProject(project, currentUser);
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
        TeamMember member = teamManager.findMemberByUserAndProject(project, currentUser);
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
        TeamMember member = teamManager.findMemberByUserAndProject(project, currentUser);
        return member != null && (member.getPosition() == HierarchicalPosition.OWNER
            || member.getPosition() == HierarchicalPosition.LEADER);
    }

    /**
     * Is the current user internal to the project team?
     *
     * @param project the project
     *
     * @return true if the current user is internal to the project
     */
    public boolean isCurrentUserInternalToProject(Project project) {
        User currentUser = requestManager.getCurrentUser();
        if (project == null || currentUser == null) {
            return false;
        }
        TeamMember member = teamManager.findMemberByUserAndProject(project, currentUser);
        return member != null && member.getPosition() != HierarchicalPosition.GUEST;
    }

    /**
     * Has the current user the right to read the card type (/ reference) ?
     * <p>
     * A user can read
     * <ul>
     * <li>any global published card type</li>
     * <li>any card type (/ reference) defined in a project he is member of</li>
     * <li>and all the chain of targets of those card types references</li>
     * </ul>
     *
     * @param cardTypeOrRefId the id of the card type or reference
     *
     * @return true if the current user can read the card type or reference
     */
    public boolean isCardTypeOrRefReadableByCurrentUser(Long cardTypeOrRefId) {
        User currentUser = requestManager.getCurrentUser();
        if (cardTypeOrRefId == null || currentUser == null) {
            return false;
        }

        List<Long> globalPublished = cardTypeManager.findGlobalPublishedCardTypeIds();
        if (globalPublished.contains(cardTypeOrRefId)) {
            return true;
        }

        List<Long> accessibleFromProjects = cardTypeManager
            .findCurrentUserReadableProjectsCardTypesIds();
        if (accessibleFromProjects.contains(cardTypeOrRefId)) {
            return true;
        }

        return false;
    }

    /**
     * Has the current user the right to read the project ?
     * <p>
     * A user can read any project he is a member of and any project which contains a card type or
     * reference the current user has a read access.
     *
     * @param projectId the id of the project
     *
     * @return True if the current user can read the project
     */
    public boolean isProjectReadableByCurrentUser(Long projectId) {
        User currentUser = requestManager.getCurrentUser();
        if (projectId == null || currentUser == null) {
            return false;
        }

        List<Long> directProjects = projectManager.findIdsOfProjectsOfCurrentUser();
        if (directProjects.contains(projectId)) {
            return true;
        }

        List<Long> accessibleByCardTypes = projectManager
            .findIdsOfProjectsReadableThroughCardTypes();
        if (accessibleByCardTypes.contains(projectId)) {
            return true;
        }

        return false;
    }
}
