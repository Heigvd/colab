/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security.permissions.card;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.security.SecurityManager;
import ch.colabproject.colab.api.security.permissions.Conditions.Condition;
import java.util.Objects;

/**
 * Card type and reference access control conditions
 *
 * @author sandra
 */
public final class CardTypeOrRefConditions {

    /**
     * Private constructor prevents instantiation
     */
    private CardTypeOrRefConditions() {
        throw new UnsupportedOperationException("This is a utility class");
    }

    /**
     * Has the current user access to the card type or reference ?
     *
     * @author sandra
     */
    public static class IsCardTypeOrRefReadable extends Condition {

        /** the card type or reference id */
        private final Long cardTypeOrRefId;

        /**
         * Create a has card type or reference read access statement
         *
         * @param cardTypeOrRefId the card type or reference id
         */
        public IsCardTypeOrRefReadable(Long cardTypeOrRefId) {
            this.cardTypeOrRefId = cardTypeOrRefId;
        }

        @Override
        protected boolean internalEval(RequestManager requestManager,
            SecurityManager securityManager) {
            return securityManager.isCardTypeOrRefReadableByCurrentUser(this.cardTypeOrRefId);
        }

        @Override
        public String toString() {
            return "IsCardTypeOrRefReadable(" + cardTypeOrRefId + ")";
        }

        @Override
        public int hashCode() {
            int hash = 3;
            hash = 43 * hash + Objects.hashCode(this.cardTypeOrRefId);
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
            final IsCardTypeOrRefReadable other = (IsCardTypeOrRefReadable) obj;
            if (!Objects.equals(this.cardTypeOrRefId, other.cardTypeOrRefId)) {
                return false;
            }
            return true;
        }
    }

}
