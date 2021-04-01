/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.AuthorityHolderType;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;

/**
 * Card definition
 *
 * @author sandra
 */
//TODO review accurate constraints when stabilised
@Entity
@NamedQuery(name = "CardDef.findAll", query = "SELECT c from CardDef c")
public class CardDef implements ColabEntity {

    /**
     * Serial version UID
     */
    private static final long serialVersionUID = 1L;

    /**
     * CardDef ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique identifier
     */
    private String uniqueId;

    /**
     * Title
     */
    private String title;

    /**
     * Purpose
     */
    private String purpose;

    /**
     * Authority holder
     */
    @Enumerated(value = EnumType.STRING)
    private AuthorityHolderType authorityHolderType;

    /**
     * Project
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    // TODO sandra - challenge JsonTransient
    private Project project;

    /**
     * @return the id
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the new id
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the uniqueId
     */
    public String getUniqueId() {
        return uniqueId;
    }

    /**
     * @param uniqueId the new uniqueId
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
     * @param title the new title
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * @return the purpose
     */
    public String getPurpose() {
        return purpose;
    }

    /**
     * @param purpose the new purpose
     */
    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    /**
     * @return the authorityHolderType
     */
    public AuthorityHolderType getAuthorityHolderType() {
        return authorityHolderType;
    }

    /**
     * @param authorityHolderType the new authorityHolderType
     */
    public void setAuthorityHolderType(AuthorityHolderType authorityHolderType) {
        this.authorityHolderType = authorityHolderType;
    }

    /**
     * @return the project
     */
    public Project getProject() {
        return project;
    }

    /**
     * @param project the new project
     */
    public void setProject(Project project) {
        this.project = project;
    }

    /**
     * {@inheritDoc }
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof CardDef) {
            CardDef o = (CardDef) other;
            // this.setUniqueId(o.getUniqueId());
            this.setTitle(o.getTitle());
            this.setPurpose(o.getPurpose());
            // this.setAuthorityHolderType(o.getAuthorityHolderType());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public int hashCode() {
        return EntityHelper.hashCode(this);
    }

    @Override
    @SuppressWarnings("EqualsWhichDoesntCheckParameterClass")
    public boolean equals(Object obj) {
        return EntityHelper.equals(this, obj);
    }

    @Override
    public String toString() {
        return "CardDef{" + "id=" + id + "uniqueId=" + uniqueId + "title=" + title + "purpose="
                + purpose + "}";
    }

}
