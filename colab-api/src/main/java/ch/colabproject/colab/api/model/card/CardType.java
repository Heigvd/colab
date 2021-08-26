/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.ConcretizationCategory;
import ch.colabproject.colab.api.security.permissions.Conditions;
import java.util.List;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.NamedQuery;

/**
 * Card type, defining what is it for
 *
 * @author sandra
 */
//TODO review accurate constraints when stabilized
@Entity
@NamedQuery(name = "CardType.findAll", query = "SELECT c FROM CardType c")
@NamedQuery(name = "CardType.findGlobals", query = "SELECT c FROM CardType c WHERE c.project is NULL")
@NamedQuery(name = "CardType.findPublishedGlobals", query = "SELECT c FROM CardType c WHERE c.project is NULL AND c.published = TRUE")
@NamedQuery(name = "CardType.findPublishedFromProjects", query = "SELECT c FROM CardType c JOIN c.project project JOIN project.teamMembers teamMember WHERE c.published = TRUE AND teamMember.user.id = :userId")
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
    private String purpose;

    /**
     * The authority holder : is it belonging to
     * <ul>
     * <li>a concrete project and behave for itself</li>
     * <li>a shared abstract model</li>
     * </ul>
     */
    @Enumerated(EnumType.STRING)
    private ConcretizationCategory authorityHolder;

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
    public String getPurpose() {
        return purpose;
    }

    /**
     * @param purpose the purpose
     */
    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    /**
     * @return Authority holder : is it belonging to
     * <ul>
     * <li>a concrete project and behave for itself</li>
     * <li>a shared abstract model</li>
     * </ul>
     */
    public ConcretizationCategory getAuthorityHolder() {
        return authorityHolder;
    }

    /**
     * @param authorityHolder the authority holder
     */
    public void setAuthorityHolder(ConcretizationCategory authorityHolder) {
        this.authorityHolder = authorityHolder;
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
            this.setPurpose(o.getPurpose());
            // this.setAuthorityHolder(o.getAuthorityHolder());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getCreateCondition() {
        if (this.getProject() != null){
            return new Conditions.IsCurrentUserMemberOfProject(this.getProject());
        } else {
            return Conditions.alwaysFalse;
        }
    }

    @Override
    public String toString() {
        return "CardType{" + "id=" + getId() + ", uniqueId=" + uniqueId + ", title=" + title
            + ", purpose=" + purpose + ", authorityHolder=" + authorityHolder + ", projectId="
            + projectId + "}";
    }

}
