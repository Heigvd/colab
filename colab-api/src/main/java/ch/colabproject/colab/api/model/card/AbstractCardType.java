/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.model.tracking.Tracking;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.AdminChannel;
import ch.colabproject.colab.api.ws.channel.BroadcastChannel;
import ch.colabproject.colab.api.ws.channel.ProjectContentChannel;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.persistence.CascadeType;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.PostLoad;
import javax.persistence.Transient;

/**
 * Abstract Card type
 *
 * @author maxence
 */
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public abstract class AbstractCardType implements ColabEntity, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * CardType ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * creation &amp; modification tracking data
     */
    @Embedded
    private Tracking trackingData;

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
     * Retrieve the complete transitive set of references to this abstract type.
     *
     * @return all references
     */
    @JsonbTransient
    public List<CardTypeRef> getAllReferences() {
        List<CardTypeRef> all = new ArrayList<>();
        all.addAll(this.directReferences);
        this.directReferences.stream().forEach(ref -> all.addAll(ref.getAllReferences()));

        return all;
    }

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
    public Set<WebsocketChannel> getChannels() {
        Set<WebsocketChannel> channels = new HashSet<>();

        // should propagate data if the type is published or if it has just been unpublished
        boolean isOrWasPublished = this.isPublished() || this.initialPublished;

        if (this.getProject() != null) {
            // this type belongs to a specific project
            // first, everyone who is editing the project shall receive updates
            channels.add(ProjectContentChannel.build(this.getProject()));

            // then, the type must be propagated to all projects which reference it
            this.directReferences.forEach(ref -> {
                channels.addAll(ref.getChannels());
            });

            if (isOrWasPublished) {
                // eventually, published types are availaible to each project members dependless
                // the project they're editing
                this.getProject().getTeamMembers().forEach(member -> {
                    User user = member.getUser();
                    if (user != null) {
                        channels.add(user.getEffectiveChannel());
                    }
                });
            }
        } else {
            //This is a global type
            if (isOrWasPublished) {
                // As the type is published, everyone may use this type -> broadcast
                channels.add(BroadcastChannel.build());
            } else {
                // Not published type are only available to admin
                channels.add(new AdminChannel());
            }
        }

        return channels;
    }

    /**
     * Get the read condition for this very type, ignoring references.
     *
     * @return the read condition
     */
    @JsonbTransient
    public Conditions.Condition getSelfReadCondition() {
        if (this.project != null) {
            return new Conditions.IsCurrentUserMemberOfProject(this.project);
        } else {
            if (this.isPublished()) {
                // Everybody can read published global types
                return Conditions.alwaysTrue;
            } else {
                // only admin can edit global types
                return Conditions.alwaysFalse;
            }
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        if (this.project != null) {
            // type belongs to a project
            List<Conditions.Condition> orList = new ArrayList<>();

            // members of the project which defined the type may read the type
            // members of project which reference this type may read it too
            orList.addAll(this.expand().stream()
                .map(ref -> ref.getSelfReadCondition()).collect(Collectors.toList()));

            // any type which references this one grant permission too
            orList.addAll(this.getAllReferences().stream()
                .map(ref -> ref.getSelfReadCondition()).collect(Collectors.toList()));

            return new Conditions.Or(orList.toArray(
                new Conditions.Condition[orList.size()]));
        } else {
            if (this.isPublished()) {
                // Everybody can read published global types
                return Conditions.alwaysTrue;
            } else {
                // only admin can edit global types
                return Conditions.alwaysFalse;
            }
        }
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
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof AbstractCardType) {
            AbstractCardType o = (AbstractCardType) other;
            this.setDeprecated(o.isDeprecated());
            this.setPublished(o.isPublished());
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
}
