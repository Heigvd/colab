/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.security.permissions.Conditions;
import java.util.List;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.NamedQuery;
import javax.persistence.OneToOne;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

/**
 * Card type, defining what is it for
 *
 * @author sandra
 */
//TODO review accurate constraints when stabilized
@Entity
@NamedQuery(name = "CardType.findAll", query = "SELECT c FROM CardType c")
@NamedQuery(name = "CardType.findGlobals",
    query = "SELECT c FROM CardType c WHERE c.project is NULL")
@NamedQuery(name = "CardType.findPublishedGlobals",
    query = "SELECT c FROM CardType c WHERE c.project is NULL AND c.published = TRUE")
@NamedQuery(name = "CardType.findPublishedFromProjects",
    query = "SELECT c FROM CardType c JOIN c.project project JOIN project.teamMembers teamMember WHERE c.published = TRUE AND teamMember.user.id = :userId")
public class CardType extends AbstractCardType {

    /**
     * Serial version UID
     */
    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * A unique identifier
     */
    private String uniqueId;

    /**
     * The title
     */
    private String title;

    /**
     * The purpose
     */
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @NotNull
    @JsonbTransient
    private Block purpose;

    /**
     * The id of the purpose
     */
    @Transient
    private Long purposeId;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
    /**
     * @return the unique identifier
     */
    public String getUniqueId() {
        return uniqueId;
    }

    /**
     * @param uniqueId the unique identifier
     */
    public void setUniqueId(String uniqueId) {
        this.uniqueId = uniqueId;
    }

    /**
     * @return the title
     */
    public String getTitle() {
        return title;
    }

    /**
     * @param title the title
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * @return the purpose
     */
    public Block getPurpose() {
        return purpose;
    }

    /**
     * @param purpose the purpose
     */
    public void setPurpose(Block purpose) {
        this.purpose = purpose;
    }

    /**
     * get the id of the purpose. To be sent to client.
     *
     * @return the id of the purpose
     */
    public Long getPurposeId() {
        if (purpose != null) {
            return purpose.getId();
        } else {
            return purposeId;
        }
    }

    /**
     * set the id of the purpose. For serialization only.
     *
     * @param purposeId the id of the purpose
     */
    public void setPurposeId(Long purposeId) {
        this.purposeId = purposeId;
    }

    @Override
    public CardType resolve() {
        return this;
    }

    @Override
    public List<AbstractCardType> expand() {
        return List.of(this);
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
    /**
     * {@inheritDoc }
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        super.merge(other);

        if (other instanceof CardType) {
            CardType o = (CardType) other;
            // this.setUniqueId(o.getUniqueId());
            this.setTitle(o.getTitle());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getCreateCondition() {
        if (this.getProject() != null) {
            return new Conditions.IsCurrentUserInternToProject(this.getProject());
        } else {
            // only admin can edit global types
            return Conditions.alwaysFalse;
        }
    }

    @Override
    public String toString() {
        return "CardType{" + "id=" + getId() + ", uniqueId=" + uniqueId + ", title=" + title
            + ", projectId=" + projectId + "}";
    }

}
