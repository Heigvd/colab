/*
 * The coLAB project
 * Copyright (C) 2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token;

import ch.colabproject.colab.api.controller.token.TokenManager;

import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.Index;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

/**
 * A token to share a project. The goal is to have a URL to send to people in
 * order to allow them to view the project and take part of the edition of a specific card.
 * <p>
 * The user must be authenticated.
 * <p>
 * If the user is not yet a member of the project, he becomes a guest team member.
 * <p>
 * If a card is specified, the user will gain a support task allowing him to
 * write in the card.
 * <p>
 * The link has no expiration. But it can be manually deleted.
 *
 * @author sandra
 */
@Entity
@Table(indexes = {
        @Index(columnList = "project_id"),
        @Index(columnList = "card_id"),
})
@NamedQuery(name = "SharingLinkToken.findByProject", query = "SELECT t from SharingLinkToken t "
        + "WHERE t.projectId = :projectId")
@NamedQuery(name = "SharingLinkToken.findByCard", query = "SELECT t from SharingLinkToken t "
        + "WHERE t.cardId = :cardId")
public class SharingLinkToken extends Token {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The id of the project that becomes visible when the token is consumed
     */
    @NotNull
    @JsonbTransient
    private Long projectId;

    /**
     * The id of the card that becomes writable when the token is consumed.
     * <p>
     * This is optional
     */
    @JsonbTransient
    private Long cardId;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the id of the project that becomes visible when the token is consumed
     */
    public Long getProjectId() {
        return projectId;
    }

    /**
     * @param projectId the id of the project that becomes visible when the token is
     *                  consumed
     */
    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    /**
     * @return the id of the card that becomes writable when the token is consumed
     */
    public Long getCardId() {
        return cardId;
    }

    /**
     * @param cardId the id of the card that becomes writable when the token is
     *               consumed
     */
    public void setCardId(Long cardId) {
        this.cardId = cardId;
    }

    // ---------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------

    @Override
    public String getRedirectTo() {
        if (this.projectId != null) {
            if (this.cardId != null) {
                // WARNING this path must be handled by front-end
                return "/project/" + projectId + "/card/" + cardId;
            } else {
                // WARNING this path must be handled by front-end
                return "/project/" + projectId;
            }
        }
        return "";
    }

    @Override
    public boolean consume(TokenManager tokenManager) {
        return tokenManager.consumeSharingLinkToken(projectId, cardId);
    }

    @Override
    public ExpirationPolicy getExpirationPolicy() {
        return ExpirationPolicy.NEVER;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public String toString() {
        return "SharingLinkToken{" + "id=" + getId()
                + ", deletion=" + getDeletionStatus() + '}';
    }
}
