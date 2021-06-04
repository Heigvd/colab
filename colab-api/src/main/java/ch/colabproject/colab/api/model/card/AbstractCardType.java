/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import java.util.ArrayList;
import java.util.List;
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
     * Is this type deprecated? A deprecated type should not be used by new projects.
     */
    private boolean deprecated;

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
     * Resolve to concrete CardType
     *
     * @return the effective cardType
     */
    public abstract CardType resolve();

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
