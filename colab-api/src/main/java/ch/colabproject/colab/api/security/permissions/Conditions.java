/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security.permissions;

import ch.colabproject.colab.api.ejb.RequestManager;
import ch.colabproject.colab.api.ejb.SecurityFacade;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.User;
import java.util.List;

/**
 * Utility class to build conditions
 *
 * @author maxence
 */
public final class Conditions {

    /**
     * A ready-to-use is Admin condition.
     */
    public static final Condition checkIfCurrentUserIsAdmin = new IsCurrentUserAdmin();

    /**
     * An always true condition
     */
    public static final Condition alwaysTrue = new AlwaysTrue();

    /**
     * A always false condition
     */
    public static final Condition alwaysFalse = new AlwaysFalse();

    /**
     * Private constructor prevents instantiation
     */
    private Conditions() {
        throw new UnsupportedOperationException("This is a utility class");
    }

    /**
     * Abstract condition. To rule them all
     */
    public static abstract class Condition {

        /**
         * Evaluation the condition
         *
         * @param requestManager the request Manager
         * @param teamFacade     the teamFacade
         *
         * @return evaluation result
         */
        public abstract boolean eval(RequestManager requestManager, SecurityFacade securityFacade);
    }

    /**
     * Always true statement
     */
    private static class AlwaysTrue extends Condition {

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            return true;
        }

        @Override
        public String toString() {
            return "true";
        }
    }

    /**
     * Always false statement
     */
    private static class AlwaysFalse extends Condition {

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            return false;
        }

        @Override
        public String toString() {
            return "false";
        }
    }

    /**
     * AND condition
     */
    public static class And extends Condition {

        /** Sub conditions */
        private Condition[] conditions;

        /**
         * Build an AND statement
         *
         * @param conditions list of all conditions that should be true
         */
        public And(Condition... conditions) {
            this.conditions = conditions;
        }

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            for (Condition c : conditions) {
                if (!c.eval(requestManager, securityFacade)) {
                    // not all conditions are true => false
                    return false;
                }
            }
            // no falsy condition found => true
            return true;
        }

        @Override
        public String toString() {
            return "And(" + List.of(conditions) + ')';
        }
    }

    /**
     * OR condition
     */
    public static class Or extends Condition {

        /** Sub conditions */
        private Condition[] conditions;

        /**
         * Build an OR statement
         *
         * @param conditions list of all conditions that should be true
         */
        public Or(Condition... conditions) {
            this.conditions = conditions;
        }

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            for (Condition c : conditions) {
                if (c.eval(requestManager, securityFacade)) {
                    // at least on sub condition is true => true
                    return true;
                }
            }
            // no true condition found => false
            return false;
        }

        @Override
        public String toString() {
            return "Or(" + List.of(conditions) + ')';
        }
    }

    /**
     * NOT
     */
    public static class Not extends Condition {

        /** the condition to negate */
        private final Condition condition;

        /**
         * Build currentUser NOT statement
         *
         * @param condition the condition to negate
         */
        public Not(Condition condition) {
            this.condition = condition;
        }

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            // just invert the given sub-conditions
            return !condition.eval(requestManager, securityFacade);
        }

        @Override
        public String toString() {
            return "Not(" + condition + ')';
        }
    }

    /**
     * Is the current user an admin ? Please use {@link Conditions#checkIfCurrentUserIsAdmin }
     * object!
     */
    private static class IsCurrentUserAdmin extends Condition {

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            User currentUser = requestManager.getCurrentUser();
            return currentUser != null && currentUser.isAdmin();
        }

        @Override
        public String toString() {
            return "IsAdmin";
        }
    }

    /**
     * Is the current user the given one ?
     */
    public static class IsCurrentUserThisUser extends Condition {

        /** user to check against */
        private final User user;

        /**
         * Check who the current user is
         *
         * @param user user to check currentUser against
         */
        public IsCurrentUserThisUser(User user) {
            this.user = user;
        }

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            User currentUser = requestManager.getCurrentUser();
            return currentUser != null && currentUser.equals(user);
        }

        @Override
        public String toString() {
            return "IsUser(" + user + ")";
        }
    }

    /**
     * The current user must be member of the given project team
     */
    public static class IsCurrentUserMemberOfProject extends Condition {

        /** the project */
        private final Project project;

        /**
         * Create a "Is current user member of this project" statement
         *
         * @param project the project to check if the current user is member of
         */
        public IsCurrentUserMemberOfProject(Project project) {
            this.project = project;
        }

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            return securityFacade.isCurrentUserMemberOfTheProjectTeam(project);
        }

        @Override
        public String toString() {
            return "IsMemberOf(" + project + ")";
        }
    }

    /**
     * The current user must be owner of the given project team
     */
    public static class IsCurrentUserOwnerOfProject extends Condition {

        /** the project */
        private final Project project;

        /**
         * Create a "Is current user owner of this project" statement
         *
         * @param project the project to check if the current user is member of
         */
        public IsCurrentUserOwnerOfProject(Project project) {
            this.project = project;
        }

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            return securityFacade.isCurrentUserOwnerOfTheProject(project);
        }

        @Override
        public String toString() {
            return "IsOwnerOf(" + project + ")";
        }
    }

    /**
     * The current user must be leader of the given project team
     */
    public static class IsCurrentUserLeaderOfProject extends Condition {

        /** the project */
        private final Project project;

        /**
         * Create a "Is current user leader of this project" statement
         *
         * @param project the project to check if the current user is member of
         */
        public IsCurrentUserLeaderOfProject(Project project) {
            this.project = project;
        }

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            return securityFacade.isCurrentUserLeaderOfTheProject(project);
        }

        @Override
        public String toString() {
            return "IsLeaderOf(" + project + ")";
        }
    }

    /**
     * The current user must be, at least, intern to given project team
     */
    public static class IsCurrentUserInternToProject extends Condition {

        /** the project */
        private final Project project;

        /**
         * Create a "Is current user leader of this project" statement
         *
         * @param project the project to check if the current user is member of
         */
        public IsCurrentUserInternToProject(Project project) {
            this.project = project;
        }

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            return securityFacade.isCurrentUserInternToProject(project);
        }

        @Override
        public String toString() {
            return "IsLeaderOf(" + project + ")";
        }
    }

    /**
     * Are current and given users teammate ?
     */
    public static class IsCurrentUserTeamMateOfUser extends Condition {

        /** the other user */
        private final User user;

        /**
         * Create a are teammate statement
         *
         * @param user the user to check against
         */
        public IsCurrentUserTeamMateOfUser(User user) {
            this.user = user;
        }

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            User currentUser = requestManager.getCurrentUser();
            return securityFacade.areUserTeammate(currentUser, this.user);
        }

        @Override
        public String toString() {
            return "IsTeamMateOf(" + user + ")";
        }
    }

    /**
     * Is the current user authenticated ?
     */
    public static class IsAuthenticated extends Condition {

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            return requestManager.isAuthenticated();
        }

        @Override
        public String toString() {
            return "IsAuthenticated";
        }
    }

    /**
     * Has the current user write access to a card ?
     */
    public static class HasCardWriteRight extends Condition {

        /** The card * */
        private final Card card;

        /**
         * Create a has write access statement
         *
         * @param card the card
         */
        public HasCardWriteRight(Card card) {
            this.card = card;
        }

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            return securityFacade.hasReadWriteAccess(card);
        }

        @Override
        public String toString() {
            return "HasCardWriteRight(" + card + ")";
        }
    }

    /**
     * Has the current user access to a card ?
     */
    public static class HasCardReadRight extends Condition {

        /** The card * */
        private final Card card;

        /**
         * Create a has write access statement
         *
         * @param card the card
         */
        public HasCardReadRight(Card card) {
            this.card = card;
        }

        @Override
        public boolean eval(RequestManager requestManager, SecurityFacade securityFacade) {
            return securityFacade.hasReadWriteAccess(card);
        }

        @Override
        public String toString() {
            return "HasCardReadRight(" + card + ")";
        }
    }

}
