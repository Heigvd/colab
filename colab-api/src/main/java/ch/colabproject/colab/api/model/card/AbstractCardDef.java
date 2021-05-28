/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.ManyToOne;
import javax.persistence.Transient;

/**
 * Abstract Card definition
 *
 * @author maxence
 */
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public abstract class AbstractCardDef implements ColabEntity, WithWebsocketChannels {

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
     * Is this definition available to other projects?
     */
    private boolean published;

    /**
     * Is this definition deprecated? A deprecated definition should not be used by new projects.
     */
    private boolean deprecated;

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
     * Resolve to concrete CardDef
     *
     * @return the effective cardDef
     */
    public abstract CardDef resolve();

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
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
