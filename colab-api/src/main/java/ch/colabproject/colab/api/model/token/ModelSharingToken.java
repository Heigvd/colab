/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token;

import ch.colabproject.colab.api.controller.token.TokenManager;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.token.tools.ModelSharingMessageBuilder;
import ch.colabproject.colab.api.security.permissions.Conditions;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Index;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

/**
 * A token to share a model
 *
 * @author sandra
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "project_id"),
    }
)
@NamedQuery(
    name = "ModelSharingToken.findByProject",
    query = "SELECT t from ModelSharingToken t WHERE t.project.id = :projectId")
public class ModelSharingToken extends Token {

    private static final long serialVersionUID = 1L;

    /**
     * Email subject
     */
    private static final String EMAIL_SUBJECT = "Co.LAB model sharing";

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The model
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JsonbTransient
    private Project project;

    /**
     * The sender name
     */
    @Transient
    @JsonbTransient
    private String senderName;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the project model
     */
    public Project getProject() {
        return project;
    }

    /**
     * @param project the project model
     */
    public void setProject(Project project) {
        this.project = project;
    }

    /**
     * @return the sender name
     */
    public String getSenderName() {
        return senderName;
    }

    /**
     * @param senderName the sender name
     */
    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    // ---------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------

    @Override
    public String getRedirectTo() {
        try {
            if (project != null && project.getId() != null) {
                return "/newModelShared/" + project.getId();
            }
        } catch (Exception e) {
            // If the project cannot be fetched (because of permission rights), just do not redirect
            return "";
        }

        return "";
    }

    @Override
    public boolean consume(TokenManager tokenManager) {
        return tokenManager.useModelSharingToken(project);
    }

    @Override
    public ExpirationPolicy getExpirationPolicy() {
        // a model sharing token can always be used several times
        return ExpirationPolicy.NEVER;
    }

    // ---------------------------------------------------------------------------------------------
    // to build a message
    // ---------------------------------------------------------------------------------------------

    @JsonbTransient
    @Override
    public String getSubject() {
        return EMAIL_SUBJECT;
    }

    @Override
    public String getEmailBody(String link) {
        return ModelSharingMessageBuilder.build(this, link);
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    @JsonbTransient
    public Conditions.Condition getCreateCondition() {
        return new Conditions.IsCurrentUserInternalToProject(project);
    }

    @Override
    public String toString() {
        return "ModelSharingToken{" + "id=" + getId() + ", senderName=" + senderName + '}';
    }

}
