/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security.permissions.project;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.security.SecurityManager;
import ch.colabproject.colab.api.security.permissions.Conditions.Condition;
import java.util.Objects;

/**
 * Project access control conditions
 *
 * @author sandra
 */
public final class ProjectConditions {

    /**
     * Private constructor prevents instantiation
     */
    private ProjectConditions() {
        throw new UnsupportedOperationException("This is a utility class");
    }

    /**
     * Has the current user access to the project ?
     *
     * @author sandra
     */
    public static class IsProjectReadable extends Condition {

        /** the project id */
        private final Long projectId;

        /**
         * Create a has project read access statement
         *
         * @param projectId the project id
         */
        public IsProjectReadable(Long projectId) {
            this.projectId = projectId;
        }

        @Override
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            return securityManager.isProjectReadableByCurrentUser(this.projectId);
        }

        @Override
        public String toString() {
            return "IsProjectReadable(" + projectId + ")";
        }

        @Override
        public int hashCode() {
            int hash = 3;
            hash = 53 * hash + Objects.hashCode(this.projectId);
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
            final IsProjectReadable other = (IsProjectReadable) obj;
            if (!Objects.equals(this.projectId, other.projectId)) {
                return false;
            }
            return true;
        }
    }

    /**
     * Has the current user access to the copy parameters of a project ?
     *
     * @author sandra
     */
    public static class IsCopyParamReadable extends Condition {

        /** the project id */
        private final Long projectId;

        /**
         * Create a has project copy parameters read access statement
         *
         * @param projectId the project id
         */
        public IsCopyParamReadable(Long projectId) {
            this.projectId = projectId;
        }

        @Override
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            return securityManager.isCopyParamReadableByCurrentUser(this.projectId);
        }

        @Override
        public String toString() {
            return "IsCopyParamReadable(" + projectId + ")";
        }

        @Override
        public int hashCode() {
            int hash = 3;
            hash = 53 * hash + Objects.hashCode(this.projectId);
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
            final IsCopyParamReadable other = (IsCopyParamReadable) obj;
            if (!Objects.equals(this.projectId, other.projectId)) {
                return false;
            }
            return true;
        }
    }

}
