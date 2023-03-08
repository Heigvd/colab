/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security.permissions;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.security.SecurityManager;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.User;
import java.util.List;
import java.util.Objects;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Utility class to build conditions
 *
 * @author maxence
 */
public final class Conditions {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(Conditions.class);

    /**
     * An always true condition
     */
    public static final Condition alwaysTrue = new AlwaysTrue();

    /**
     * A always false condition
     */
    public static final Condition alwaysFalse = new AlwaysFalse();

    /**
     * By default if the situation cannot happen
     */
    public static final Condition defaultForOrphan = alwaysTrue;

    /**
     * Is the current authenticated condition
     */
    public static final Condition authenticated = new IsAuthenticated();

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
         * Evaluate the condition
         *
         * @param requestManager  the request Manager
         * @param securityManager the security manager
         *
         * @return evaluation result
         */
        public boolean eval(RequestManager requestManager, SecurityManager securityManager) {
            Boolean cachedResult = requestManager.getConditionResult(this);
            if (cachedResult != null) {
                logger.trace("Condition {} is cached and {}", this, cachedResult);
                return cachedResult;
            } else {
                boolean result = this.internalEval(requestManager, securityManager);
                logger.trace("Condition {} is not cached and {}", this, result);
                requestManager.registerConditionResult(this, result);
                return result;
            }
        }

        /**
         * Evaluate the condition
         *
         * @param requestManager  the request Manager
         * @param securityManager the security manager
         *
         * @return evaluation result
         */
        protected abstract boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager);
    }

    /**
     * Always true statement
     */
    private static class AlwaysTrue extends Condition {

        @Override
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            return true;
        }

        @Override
        public String toString() {
            return "true";
        }

        @Override
        public boolean equals(Object obj) {
            return obj instanceof AlwaysTrue;
        }

        @Override
        public int hashCode() {
            int hash = 7;
            hash = 31 * hash + Objects.hashCode(true);
            return hash;
        }
    }

    /**
     * Always false statement
     */
    private static class AlwaysFalse extends Condition {

        @Override
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            return false;
        }

        @Override
        public String toString() {
            return "false";
        }

        @Override
        public boolean equals(Object obj) {
            return obj instanceof AlwaysFalse;
        }

        @Override
        public int hashCode() {
            int hash = 7;
            hash = 31 * hash + Objects.hashCode(true);
            return hash;
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
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            for (Condition c : conditions) {
                if (!c.eval(requestManager, securityManager)) {
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

        @Override
        public int hashCode() {
            int hash = 3;
            hash = 31 * hash + new HashCodeBuilder().append(this.conditions).toHashCode();
            return hash;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            final And other = (And) obj;
            if (!Objects.equals(this.conditions, other.conditions)) {
                return false;
            }
            return true;
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
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            for (Condition c : conditions) {
                if (c.eval(requestManager, securityManager)) {
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

        @Override
        public int hashCode() {
            int hash = 3;
            hash = 59 * hash + new HashCodeBuilder().append(this.conditions).toHashCode();
            return hash;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            final Or other = (Or) obj;
            if (!new EqualsBuilder().append(this.conditions, other.conditions).isEquals()) {
                return false;
            } else {
                return true;
            }
        }
    }

    /**
     * NOT
     */
    public static class Not extends Condition {

        /** the condition to negate */
        private final Condition condition;

        /**
         * Build a NOT statement
         *
         * @param condition the condition to negate
         */
        public Not(Condition condition) {
            this.condition = condition;
        }

        @Override
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            // just invert the given sub-conditions
            return !condition.eval(requestManager, securityManager);
        }

        @Override
        public String toString() {
            return "Not(" + condition + ')';
        }

        @Override
        public int hashCode() {
            int hash = 5;
            hash = 37 * hash + Objects.hashCode(this.condition);
            return hash;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            final Not other = (Not) obj;
            if (!Objects.equals(this.condition, other.condition)) {
                return false;
            }
            return true;
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
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            User currentUser = requestManager.getCurrentUser();
            return currentUser != null && currentUser.equals(user);
        }

        @Override
        public String toString() {
            return "IsUser(" + user + ")";
        }

        @Override
        public int hashCode() {
            int hash = 5;
            hash = 73 * hash + Objects.hashCode(this.user);
            return hash;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            final IsCurrentUserThisUser other = (IsCurrentUserThisUser) obj;
            if (!Objects.equals(this.user, other.user)) {
                return false;
            }
            return true;
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
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            return securityManager.isCurrentUserMemberOfTheProjectTeam(project);
        }

        @Override
        public String toString() {
            return "IsMemberOf(" + project + ")";
        }

        @Override
        public int hashCode() {
            int hash = 7;
            hash = 37 * hash + Objects.hashCode(this.project);
            return hash;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            final IsCurrentUserMemberOfProject other = (IsCurrentUserMemberOfProject) obj;
            if (!Objects.equals(this.project, other.project)) {
                return false;
            }
            return true;
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
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            return securityManager.isCurrentUserOwnerOfTheProject(project);
        }

        @Override
        public String toString() {
            return "IsOwnerOf(" + project + ")";
        }

        @Override
        public int hashCode() {
            int hash = 3;
            hash = 23 * hash + Objects.hashCode(this.project);
            return hash;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            final IsCurrentUserOwnerOfProject other = (IsCurrentUserOwnerOfProject) obj;
            if (!Objects.equals(this.project, other.project)) {
                return false;
            }
            return true;
        }
    }

    /**
     * The current user must be, at least, internal to given project team
     */
    public static class IsCurrentUserInternalToProject extends Condition {

        /** the project */
        private final Project project;

        /**
         * Create a "Is current user internal to this project" statement
         *
         * @param project the project to check if the current user is member of
         */
        public IsCurrentUserInternalToProject(Project project) {
            this.project = project;
        }

        @Override
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            return securityManager.isCurrentUserInternalToProject(project);
        }

        @Override
        public String toString() {
            return "IsInternalTo(" + project + ")";
        }

        @Override
        public int hashCode() {
            int hash = 7;
            hash = 67 * hash + Objects.hashCode(this.project);
            return hash;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            final IsCurrentUserInternalToProject other = (IsCurrentUserInternalToProject) obj;
            if (!Objects.equals(this.project, other.project)) {
                return false;
            }
            return true;
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
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            User currentUser = requestManager.getCurrentUser();
            return currentUser != null && securityManager.areUserTeammate(currentUser, this.user);
        }

        @Override
        public String toString() {
            return "IsTeamMateOf(" + user + ")";
        }

        @Override
        public int hashCode() {
            int hash = 3;
            hash = 31 * hash + Objects.hashCode(this.user);
            return hash;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            final IsCurrentUserTeamMateOfUser other = (IsCurrentUserTeamMateOfUser) obj;
            if (!Objects.equals(this.user, other.user)) {
                return false;
            }
            return true;
        }
    }

    /**
     * Do current and given user work on a common project ?
     */
    public static class DoCurrentUserWorkOnSameProjectThanUser extends Condition {

        /** the other user */
        private final User user;

        /**
         * Create a are teammate statement
         *
         * @param user the user to check against
         */
        public DoCurrentUserWorkOnSameProjectThanUser(User user) {
            this.user = user;
        }

        @Override
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            User currentUser = requestManager.getCurrentUser();
            return currentUser != null
                && securityManager.doUsersHaveCommonProject(currentUser, this.user);
        }

        @Override
        public String toString() {
            return "DoCurrentUserWorkOnSameProjectThanUser(" + user + ")";
        }

        @Override
        public int hashCode() {
            int hash = 3;
            hash = 31 * hash + Objects.hashCode(this.user);
            return hash;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            final DoCurrentUserWorkOnSameProjectThanUser other = (DoCurrentUserWorkOnSameProjectThanUser) obj;
            if (!Objects.equals(this.user, other.user)) {
                return false;
            }
            return true;
        }
    }

    /**
     * Is the current user authenticated ?
     */
    private static class IsAuthenticated extends Condition {

        @Override
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            return requestManager.isAuthenticated();
        }

        @Override
        public String toString() {
            return "IsAuthenticated";
        }

        @Override
        public boolean equals(Object obj) {
            return obj instanceof IsAuthenticated;
        }

        @Override
        public int hashCode() {
            int hash = 7;
            hash = 83 * hash;
            return hash;
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

        /**
         * Create a has write access statement
         *
         * @param cardContent a card content
         */
        public HasCardWriteRight(CardContent cardContent) {
            this.card = cardContent.getCard();
        }

        @Override
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            return securityManager.hasReadWriteAccess(card);
        }

        @Override
        public String toString() {
            return "HasCardWriteRight(" + card + ")";
        }

        @Override
        public int hashCode() {
            int hash = 7;
            hash = 47 * hash + Objects.hashCode(this.card);
            return hash;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            final HasCardWriteRight other = (HasCardWriteRight) obj;
            if (!Objects.equals(this.card, other.card)) {
                return false;
            }
            return true;
        }
    }

    /**
     * Has the current user access to a card ?
     */
    public static class HasCardReadRight extends Condition {

        /** The card * */
        private final Card card;

        /**
         * Create a has read access statement
         *
         * @param card the card
         */
        public HasCardReadRight(Card card) {
            this.card = card;
        }

        /**
         * Create a has read access statement
         *
         * @param cardContent a card content
         */
        public HasCardReadRight(CardContent cardContent) {
            this.card = cardContent.getCard();
        }

        @Override
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            return securityManager.hasReadAccess(card);
        }

        @Override
        public String toString() {
            return "HasCardReadRight(" + card + ")";
        }

        @Override
        public int hashCode() {
            int hash = 3;
            hash = 71 * hash + Objects.hashCode(this.card);
            return hash;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            final HasCardReadRight other = (HasCardReadRight) obj;
            if (!Objects.equals(this.card, other.card)) {
                return false;
            }
            return true;
        }
    }

}
