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
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.ws.channel.ProjectContentChannel;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import java.util.Set;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
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
     * Authority holder : is it belonging to
     * <ul>
     * <li>a concrete project and behave for itself</li>
     * <li>a shared abstract model</li>
     * </ul>
     */
    @Enumerated(value = EnumType.STRING)
    private ConcretizationCategory authorityHolder;

    /**
     * Project
     */
    @ManyToOne
    // @JsonbTransient
    // TODO sandra - challenge JsonbTransient
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
     * @param authorityHolder new authority holder
     */
    public void setAuthorityHolder(ConcretizationCategory authorityHolder) {
        this.authorityHolder = authorityHolder;
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
            // this.setAuthorityHolder(o.getAuthorityHolder());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.project != null) {
            return Set.of(ProjectContentChannel.build(project));
        } else {
            return Set.of();
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
