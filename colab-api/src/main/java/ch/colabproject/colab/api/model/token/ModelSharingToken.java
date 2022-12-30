/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token;

import ch.colabproject.colab.api.controller.token.TokenManager;
import ch.colabproject.colab.api.model.project.InstanceMaker;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.token.tools.ModelSharingMessageBuilder;
import ch.colabproject.colab.api.security.permissions.Conditions;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.Index;
import javax.persistence.NamedQuery;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * A token to share a model to a user
 *
 * @author sandra
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "instancemaker_id"),
    }
)
@NamedQuery(
    name = "ModelSharingToken.findByProjectAndRecipient",
    query = "SELECT t from ModelSharingToken t "
        + "WHERE t.instanceMaker.project.id = :projectId AND t.recipient = :recipient")
//@NamedQuery(
//    name = "ModelSharingToken.findByInstanceMaker",
//    query = "SELECT t from ModelSharingToken t WHERE t.instanceMaker.id = :instanceMakerId")
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
     * The pending instance maker
     */
    @OneToOne
    @NotNull
    @JsonbTransient
    private InstanceMaker instanceMaker;

    /**
     * The sender name
     */
    @Size(max = 255)
    @JsonbTransient
    private String sender;

    /**
     * The email address to send the sharing to
     */
    @Size(max = 255)
    @JsonbTransient
    private String recipient;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the pending instance maker
     */
    public InstanceMaker getInstanceMaker() {
        return instanceMaker;
    }

    /**
     * @param instanceMaker the pending instance maker
     */
    public void setInstanceMaker(InstanceMaker instanceMaker) {
        this.instanceMaker = instanceMaker;
    }

    /**
     * @return the sender name
     */
    public String getSender() {
        return sender;
    }

    /**
     * @param sender the sender name
     */
    public void setSender(String sender) {
        this.sender = sender;
    }

    /**
     * @return the email address to send the sharing to
     */
    public String getRecipient() {
        return recipient;
    }

    /**
     * @param recipient the email address to send the sharing to
     */
    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    // ---------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------

    @Override
    public String getRedirectTo() {
        if (this.instanceMaker != null && this.instanceMaker.getUser() != null) {
            // if link from user to project is not set, do not even try to read the project
            // on the one hand it won't be useful
            // and on the other hand it could lead to an access denied exception

            Project project = getProject();
            if (project != null && project.getId() != null) {
                return "/newModelShared/" + project.getId();
            }
        }

        return "";
    }

    @Override
    public boolean consume(TokenManager tokenManager) {
        return tokenManager.consumeModelSharingToken(instanceMaker);
    }

    @Override
    public ExpirationPolicy getExpirationPolicy() {
        return ExpirationPolicy.ONE_SHOT;
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

    /**
     * If instance maker is set, return the associated project
     *
     * @return the model project
     */
    @JsonbTransient
    public Project getProject() {
        if (instanceMaker != null) {
            return instanceMaker.getProject();
        }
        return null;
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getCreateCondition() {
        return new Conditions.IsCurrentUserMemberOfProject(getProject());
    }

    @Override
    public String toString() {
        return "ModelSharingToken{" + "id=" + getId() + ", sender=" + sender + '}';
    }

}
