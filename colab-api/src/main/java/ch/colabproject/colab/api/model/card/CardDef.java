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
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.Transient;

/**
 * Card definition
 *
 * @author sandra
 */
//TODO review accurate constraints when stabilized
@Entity
@NamedQuery(name = "CardDef.findAll", query = "SELECT c FROM CardDef c")
@NamedQuery(
        name = "CardDef.findCardDefByProject",
        query = "SELECT c FROM CardDef c JOIN c.project p WHERE p.id = :projectId")
public class CardDef implements ColabEntity {

    /**
     * Serial version UID
     */
    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * CardDef ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    @Enumerated(value = EnumType.STRING)
    private ConcretizationCategory authorityHolder;

    /**
     * The project it belongs to
     */
    @ManyToOne
    @JsonbTransient
    private Project project;

    /**
     * The id of the project (serialization sugar)
     */
    @Transient
    private Long projectId;

    // Is there a need to have a list of its cards ?

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the cardDef ID
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the cardDef ID
     */
    public void setId(Long id) {
        this.id = id;
    }

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
     *         <ul>
     *         <li>a concrete project and behave for itself</li>
     *         <li>a shared abstract model</li>
     *         </ul>
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

    /**
     * @return the project it belongs to
     */
    public Project getProject() {
        return project;
    }

    /**
     * @param project the project it belongs to
     */
    public void setProject(Project project) {
        this.project = project;
    }

    /**
     * get the project id. To be sent to client
     *
     * @return id of the project or null
     */
    public Long getProjectId() {
        if (this.project != null) {
            return this.project.getId();
        } else {
            return projectId;
        }
    }

    /**
     * set the project id. For serialization only
     *
     * @param id the id of the project
     */
    public void setProjectId(Long id) {
        this.projectId = id;
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
        return "CardDef{" + "id=" + id + ", uniqueId=" + uniqueId + ", title=" + title
                + ", purpose=" + purpose + ", authorityHolder=" + authorityHolder + ", projectId="
                + getProjectId() + "}";
    }

}
