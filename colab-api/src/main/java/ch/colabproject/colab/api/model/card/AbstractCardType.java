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
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.ws.channel.AdminChannel;
import ch.colabproject.colab.api.ws.channel.BroadcastChannel;
import ch.colabproject.colab.api.ws.channel.ProjectContentChannel;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
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
     * List of references to this type
     */
    @JsonbTransient
    @OneToMany(mappedBy = "cardType", cascade = CascadeType.ALL)
    private List<CardTypeRef> references = new ArrayList<>();

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
     * Get references
     *
     * @return list of references
     */
    public List<CardTypeRef> getReferences() {
        return references;
    }

    /**
     * Set the list of references
     *
     * @param references list of references
     */
    public void setReferences(List<CardTypeRef> references) {
        this.references = references;
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
    public Set<WebsocketChannel> getChannels() {
        Set<WebsocketChannel> channels = new HashSet<>();

        // should propagate data if the type is published or if it has just been unpublished
        boolean isOrWasPublished = this.isPublished() || this.initialPublished;

        if (this.getProject() != null) {
            // this type belongs to a specific project
            // first, everyone who is editing the project shall receive updates
            channels.add(ProjectContentChannel.build(this.getProject()));

            // then, the type must be propagated to all projects which reference it
            this.references.forEach(ref -> {
                channels.addAll(ref.getChannels());
            });

            if (isOrWasPublished) {
                // eventually, published types are availaible to each project members dependless
                // the project they're editing
                this.getProject().getTeamMembers().forEach(member -> {
                    User user = member.getUser();
                    if (user != null) {
                        channels.addAll(user.getChannels());
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
