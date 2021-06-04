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
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Transient;

/**
 * Card
 * <p>
 * It is defined by a cardType. The content is stored in one or several
 * CardContent.
 *
 * @author sandra
 */
// TODO review accurate constraints when stabilized
@Entity
@NamedQuery(name = "Card.findAll", query = "SELECT c FROM Card c")
public class Card implements ColabEntity, WithWebsocketChannels {

    /**
     * Serial version UID
     */
    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * Card ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The index of the card within its parent
     */
    private int index;

    /**
     * The color of the card
     */
    private String color;

    /**
     * The card type defining what is it for
     */
    @ManyToOne
    @JsonbTransient
    private AbstractCardType cardType;

    /**
     * The id of the card type (serialization sugar)
     */
    @Transient
    private Long cardTypeId;

    /**
     * The project this card is root of. may be null
     */
    @OneToOne(mappedBy = "rootCard")
    @JsonbTransient
    private Project rootCardProject;

    /**
     * The id of the project for root cards (serialization sugar)
     */
    @Transient
    private Long rootCardProjectId;

    /**
     * The parent card content
     * <p>
     * A card can either be the root card of a project or be within a card content
     */
    @ManyToOne
    @JsonbTransient
    private CardContent parent;

    /**
     * The id of the parent card content (serialization sugar)
     */
    @Transient
    private Long parentId;

    /**
     * The list of content variants.
     * <p>
     * There can be several variants of content
     */
    // TODO sandra - see where it is suitable to order it
    // TODO sandra - challenge cascade
    // TODO sandra - challenge ArrayList
    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL) // , fetch = FetchType.LAZY)
    @JsonbTransient
    private List<CardContent> contentVariants = new ArrayList<>();

    /**
     * The list of abstract resources directly linked to this card
     */
    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<AbstractResource> directAbstractResources = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
    /**
     * @return the card id
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the card id
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the index of the card in its parent
     */
    public int getIndex() {
        return index;
    }

    /**
     * @param index the new index of the card in its parent
     */
    public void setIndex(int index) {
        this.index = index;
    }

    /**
     * @return the color of the card
     */
    public String getColor() {
        return color;
    }

    /**
     * @param color the new color of the card
     */
    public void setColor(String color) {
        this.color = color;
    }

    /**
     * @return the card type defining what is it for
     */
    public AbstractCardType getCardType() {
        return cardType;
    }

    /**
     * @param cardType the card type defining what is it for
     */
    public void setCardType(AbstractCardType cardType) {
        this.cardType = cardType;
    }

    /**
     * get the id of the card type. To be sent to client
     *
     * @return the id of the card type
     */
    public Long getCardTypeId() {
        if (this.cardType != null) {
            return this.cardType.getId();
        } else {
            return cardTypeId;
        }
    }

    /**
     * @param cardTypeId the card type id to set
     */
    public void setCardTypeId(Long cardTypeId) {
        this.cardTypeId = cardTypeId;
    }

    /**
     * @return the parent card content
     *         <p>
     *         A card can either be the root card of a project or be within a card
     *         content
     */
    public CardContent getParent() {
        return parent;
    }

    /**
     * @param parent the parent card content
     */
    public void setParent(CardContent parent) {
        this.parent = parent;
    }

    /**
     * get the id of the parent card content. To be sent to client
     *
     * @return the id of the parent card content
     */
    public Long getParentId() {
        if (this.parent != null) {
            return parent.getId();
        } else {
            return parentId;
        }
    }

    /**
     * set the id of the parent card content. For serialization only
     *
     * @param parentId the id of the parent card content
     */
    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    /**
     * Get the project this card is root of.
     *
     * @return the project
     */
    public Project getRootCardProject() {
        return rootCardProject;
    }

    /**
     * Set the project this card is the root of
     *
     * @param rootCardProject the project
     */
    public void setRootCardProject(Project rootCardProject) {
        this.rootCardProject = rootCardProject;
    }

    /**
     * get the id of the rootCardProject. To be sent to client.
     *
     * @return the id of the rootCardProject
     */
    public Long getRootCardProjectId() {
        if (this.rootCardProject != null) {
            return rootCardProject.getId();
        } else {
            return rootCardProjectId;
        }
    }

    /**
     * set the id of the rootCard project. For serialization only.
     *
     * @param rootCardProjectId the id of the root-card project
     */
    public void setRootCardProjectId(Long rootCardProjectId) {
        this.rootCardProjectId = rootCardProjectId;
    }

    /**
     * @return the list of variants of card content
     */
    public List<CardContent> getContentVariants() {
        return contentVariants;
    }

    /**
     * @param contentVariantList the list of variants of card content
     */
    public void setContentVariants(List<CardContent> contentVariantList) {
        this.contentVariants = contentVariantList;
    }

    /**
     * @return the list of abstract resources directly linked to this card
     */
    public List<AbstractResource> getDirectAbstractResources() {
        return directAbstractResources;
    }

    /**
     * @param abstractResources the list of abstract resources directly linked to this card
     */
    public void setDirectAbstractResources(List<AbstractResource> abstractResources) {
        this.directAbstractResources = abstractResources;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
    /**
     * {@inheritDoc }
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof Card) {
            Card o = (Card) other;
            this.setIndex(o.getIndex());
            this.setColor(o.getColor());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.rootCardProject != null) {
            // this card is a root card, propagate through the project channels
            return this.rootCardProject.getChannels();
        } else if (this.parent != null) {
            // this card is a sub-card, propagate through its parent channels
            return this.parent.getChannels();
        } else if (this.cardType != null) {
            // such a card shouldn't exist...
            // Lorem-ipsum cards for global cardTypes ???
            return this.cardType.getChannels();
        } else {
            // such an orphan card shouldn't exist...
            return Set.of();
        }
    }

    /**
     * Get the project this card belongs to.
     *
     * @return card owner
     */
    @JsonbTransient
    public Project getProject() {
        if (this.rootCardProject != null) {
            // this card is a root card
            return this.rootCardProject;
        } else if (this.parent != null) {
            // this card is a sub-card
            return this.parent.getProject();
        }
        return null;
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
        return "Card{" + "id=" + id + ", index=" + index + ", color=" + color + ", cardTypeId="
            + getCardTypeId() + ", parentId=" + getParentId() + "}";
    }

}
