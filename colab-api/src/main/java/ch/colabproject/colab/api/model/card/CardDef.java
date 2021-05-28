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
import ch.colabproject.colab.api.ws.channel.ProjectContentChannel;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import java.util.Set;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.NamedQuery;

/**
 * Card definition
 *
 * @author sandra
 */
//TODO review accurate constraints when stabilized
@Entity
@NamedQuery(name = "CardDef.findAll", query = "SELECT c FROM CardDef c")
@NamedQuery(name = "CardDef.findGlobals", query = "SELECT c FROM CardDef c WHERE c.project is NULL")
@NamedQuery(name = "CardDef.findPublishedGlobals", query = "SELECT c FROM CardDef c WHERE c.project is NULL AND c.published = TRUE")
@NamedQuery(name = "CardDef.findPublishedFromProjects", query = "SELECT c FROM CardDef c JOIN c.project project JOIN project.teamMembers teamMember WHERE c.published = TRUE AND teamMember.user.id = :userId")
public class CardDef extends AbstractCardDef {

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
    public CardDef resolve() {
        return this;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
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
            // this.setAuthorityHolder(o.getAuthorityHolder());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.getProject() != null) {
            return Set.of(ProjectContentChannel.build(this.getProject()));
        } else {
            return Set.of();
        }
    }

    @Override
    public String toString() {
        return "CardDef{" + "id=" + getId() + ", uniqueId=" + uniqueId + ", title=" + title
            + ", purpose=" + purpose + ", authorityHolder=" + authorityHolder + ", projectId="
            + getProjectId() + "}";
    }

}
