/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.security.permissions.Conditions;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import jakarta.json.bind.annotation.JsonbTransient;
import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Card type, defining what is it for
 *
 * @author sandra
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "purpose_id")
    }
)
@NamedQuery(name = "CardType.findGlobals",
    query = "SELECT ct FROM CardType ct WHERE ct.project is NULL")
@NamedQuery(name = "CardType.findPublishedGlobals",
    query = "SELECT ct FROM CardType ct WHERE ct.project is NULL AND ct.published = TRUE")
@NamedQuery(name = "CardType.findIdsOfPublishedGlobal",
    query = "SELECT ct.id FROM CardType ct WHERE ct.project is NULL AND ct.published = TRUE")
public class CardType extends AbstractCardType {

    private static final long serialVersionUID = 1L;

    /**
     * The title
     */
    @Size(max = 255)
    private String title;

    /**
     * Tags
     */
    @ElementCollection
    @CollectionTable(indexes = {
        @Index(columnList = "cardtype_id")
    })
    @NotNull
    private Set<String> tags = new HashSet<>();

    /**
     * The purpose
     */
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @NotNull
    @JsonbTransient
    private TextDataBlock purpose;

    /**
     * The id of the purpose
     */
    @Transient
    private Long purposeId;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

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
     * Get tags
     *
     * @return get the list of tags
     */
    public Set<String> getTags() {
        return tags;
    }

    /**
     * Set tags
     *
     * @param tags new set of tags
     */
    public void setTags(Set<String> tags) {
        this.tags = tags;
    }

    /**
     * @return the purpose
     */
    public TextDataBlock getPurpose() {
        return purpose;
    }

    /**
     * @param purpose the purpose
     */
    public void setPurpose(TextDataBlock purpose) {
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

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public CardType resolve() {
        return this;
    }

    @Override
    public List<AbstractCardType> expand() {
        return List.of(this);
    }

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        super.merge(other);

        if (other instanceof CardType) {
            CardType o = (CardType) other;
            this.setTitle(o.getTitle());
            this.setTags(o.getTags());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getCreateCondition() {
        if (this.getProject() != null) {
            return new Conditions.IsCurrentUserInternalToProject(this.getProject());
        } else {
            // only admin can edit global types
            return Conditions.alwaysFalse;
        }
    }

    @Override
    public String toString() {
        return "CardType{" + "id=" + getId() + ", title=" + title
            + ", projectId=" + projectId + "}";
    }

}
