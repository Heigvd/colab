/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import static ch.colabproject.colab.api.model.card.Card.STRUCTURE_SEQUENCE_NAME;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Resourceable;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.model.tracking.Tracking;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.security.permissions.card.CardTypeOrRefConditions;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.AboutCardTypeChannelsBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import java.util.ArrayList;
import java.util.List;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.persistence.CascadeType;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.PostLoad;
import javax.persistence.Table;
import javax.persistence.Transient;

/**
 * Abstract Card type
 *
 * @author maxence
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "project_id"),
    }
)
@NamedQuery(name = "AbstractCardType.findPublishedByProjectTeamMemberUser",
    query = "SELECT act FROM AbstractCardType act"
        + " JOIN act.project proj"
        + " JOIN proj.teamMembers memb"
        + " WHERE act.published = TRUE AND memb.user.id = :userId")
@NamedQuery(name = "AbstractCardType.findIdsByProjectTeamMemberUser",
    query = "SELECT act.id FROM AbstractCardType act"
        + " JOIN act.project proj"
        + " JOIN proj.teamMembers memb"
        + " WHERE memb.user.id = :userId")
@NamedQuery(name = "AbstractCardType.findProjectId",
    query = "SELECT act.project.id FROM AbstractCardType act WHERE act.id in :listId")
@Inheritance(strategy = InheritanceType.JOINED)
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public abstract class AbstractCardType implements ColabEntity, WithWebsocketChannels, Resourceable {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * CardType ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = STRUCTURE_SEQUENCE_NAME)
    private Long id;

    /**
     * creation + modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * Is this type available to other projects?
     */
    private boolean published;

    /**
     * published state on load
     */
    @Transient
    private boolean initialPublished;

    /**
     * Is this type deprecated? A deprecated type should not be used by new projects.
     */
    private boolean deprecated;

    /**
     * The project it belongs to. If project is null, it means the type is a global type
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private Project project;

    /**
     * The id of the project (serialization sugar)
     */
    @Transient
    protected Long projectId;

    /**
     * List of direct references to this type
     */
    @OneToMany(mappedBy = "target", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<CardTypeRef> directReferences = new ArrayList<>();

    /**
     * The list of all cards implementing this card definition
     */
    @OneToMany(mappedBy = "cardType", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<Card> implementingCards = new ArrayList<>();

    /**
     * The list of abstract resources directly linked to this card definition
     */
    @OneToMany(mappedBy = "abstractCardType", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<AbstractResource> directAbstractResources = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the cardType ID
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the cardType ID
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Get the tracking data
     *
     * @return tracking data
     */
    @Override
    public Tracking getTrackingData() {
        return trackingData;
    }

    /**
     * Set tracking data
     *
     * @param trackingData new tracking data
     */
    @Override
    public void setTrackingData(Tracking trackingData) {
        this.trackingData = trackingData;
    }

    /**
     * Get the value of published
     *
     * @return the value of published
     */
    public boolean isPublished() {
        return published;
    }

    /**
     * Set the value of published
     *
     * @param published new value of published
     */
    public void setPublished(boolean published) {
        this.published = published;
    }

    /**
     * Get the value of deprecated
     *
     * @return the value of deprecated
     */
    public boolean isDeprecated() {
        return deprecated;
    }

    /**
     * Set the value of deprecated
     *
     * @param deprecated new value of deprecated
     */
    public void setDeprecated(boolean deprecated) {
        this.deprecated = deprecated;
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

    /**
     * Resolve to concrete CardType Get references
     *
     * @return list of references
     */
    public List<CardTypeRef> getDirectReferences() {
        return directReferences;
    }

    /**
     * Set the list of references
     *
     * @param references list of references
     */
    public void setDirectReferences(List<CardTypeRef> references) {
        this.directReferences = references;
    }

    /**
     * @return the list of all cards implementing this card definition
     */
    public List<Card> getImplementingCards() {
        return implementingCards;
    }

    /**
     * @param implementingCards the list of all cards implementing this card definition
     */
    public void setImplementingCards(List<Card> implementingCards) {
        this.implementingCards = implementingCards;
    }

    /**
     * @return the list of abstract resources directly linked to this card definition
     */
    @Override
    public List<AbstractResource> getDirectAbstractResources() {
        return directAbstractResources;
    }

    /**
     * @param abstractResources the list of abstract resources directly linked to this card
     *                          definition
     */
    public void setDirectAbstractResources(List<AbstractResource> abstractResources) {
        this.directAbstractResources = abstractResources;
    }

    // ---------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------

    /**
     * @return is now published or was just unpublished
     */
    public boolean isOrWasPublished() {
        return this.isPublished() || this.initialPublished;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    /**
     * Resolve to concrete CardType
     *
     * @return the effective cardType
     */
    public abstract CardType resolve();

    /**
     * Resolve to concrete type and return all transitive references too.
     *
     * @return concrete type and transitive references
     */
    public abstract List<AbstractCardType> expand();

    /**
     * JPA post-load callback. Used to keep trace of the initial value of the <code>published</code>
     * field.
     */
    @PostLoad
    public void postLoad() {
        // keep trace of modification
        this.initialPublished = this.published;
    }

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof AbstractCardType) {
            AbstractCardType o = (AbstractCardType) other;
            this.setPublished(o.isPublished());
            this.setDeprecated(o.isDeprecated());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public ChannelsBuilder getChannelsBuilder() {
        return new AboutCardTypeChannelsBuilder(this);
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        return new CardTypeOrRefConditions.IsCardTypeOrRefReadable(this.id);
    }

    @Override
    public Conditions.Condition getUpdateCondition() {
        if (this.project != null) {
            // type belongs to a project
            return this.project.getUpdateCondition();
        } else {
            // only admin can edit global types
            return Conditions.alwaysFalse;
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
}
