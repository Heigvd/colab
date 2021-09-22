/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.link.StickyNoteSourceable;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.model.tracking.Tracking;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
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
import javax.persistence.Transient;

/**
 * A resource is a document provided to help the users to fulfill their goals.
 * <p>
 * An abstract resource is either a resource directly representing a document or a reference to
 * another abstract resource.
 * <p>
 * An abstract resource can be linked either to a card type / card type reference, or to a card or
 * to a card content.
 *
 * @author sandra
 */
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public abstract class AbstractResource
    implements ColabEntity, WithWebsocketChannels, StickyNoteSourceable {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * Abstract resource ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    /**
     * creation &amp; modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * The card type / card type reference to which the abstract resource is linked
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private AbstractCardType abstractCardType;

    /**
     * The card type id / card type reference id (serialization sugar)
     */
    @Transient
    private Long abstractCardTypeId;

    /**
     * The card to which the abstract resource is linked
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private Card card;

    /**
     * The card id (serialization sugar)
     */
    @Transient
    private Long cardId;

    /**
     * The card content to which the abstract resource is linked
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private CardContent cardContent;

    /**
     * The card content id (serialization sugar)
     */
    @Transient
    private Long cardContentId;

    /**
     * The category to classify the resource
     */
    private String category;

    // TODO see if useful
    /**
     * The list of resource references that link to this abstract resource
     */
    @OneToMany(mappedBy = "target", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<ResourceRef> directReferences = new ArrayList<>();

    /**
     * The list of sticky note links of which the resource is the source
     */
    @OneToMany(mappedBy = "srcResourceOrRef", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<StickyNoteLink> stickyNoteLinksAsSrc = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
    /**
     * @return the abstract resource id
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the abstract resource id
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the card type / card type reference to which an abstract resource is linked
     */
    public AbstractCardType getAbstractCardType() {
        return abstractCardType;
    }

    /**
     * @param abstractCardType the card type / card type reference to which an abstract resource is
     *                         linked
     */
    public void setAbstractCardType(AbstractCardType abstractCardType) {
        this.abstractCardType = abstractCardType;
    }

    /**
     * get the id of the card type / card type reference to which an abstract resource is linked. To
     * be sent to client.
     *
     * @return the ID of the abstract card type
     */
    public Long getAbstractCardTypeId() {
        if (this.abstractCardType != null) {
            return abstractCardType.getId();
        } else {
            return abstractCardTypeId;
        }
    }

    /**
     * set the id of the card type / card type reference to which an abstract resource is linked.
     * For serialization only.
     *
     * @param abstractCardTypeId the ID of the abstract card type
     */
    public void setAbstractCardTypeId(Long abstractCardTypeId) {
        this.abstractCardTypeId = abstractCardTypeId;
    }

    /**
     * @return True if there is a linked abstract card type
     */
    public boolean hasAbstractCardType() {
        return abstractCardType != null || abstractCardTypeId != null;
    }

    /**
     * @return the card to which an abstract resource is linked
     */
    public Card getCard() {
        return card;
    }

    /**
     * @param card the card to which an abstract resource is linked
     */
    public void setCard(Card card) {
        this.card = card;
    }

    /**
     * get the id of the card to which an abstract resource is linked. To be sent to client.
     *
     * @return the ID of the card
     */
    public Long getCardId() {
        if (this.card != null) {
            return card.getId();
        } else {
            return cardId;
        }
    }

    /**
     * set the id of the card to which an abstract resource is linked. For serialization only.
     *
     * @param cardId the ID of the card
     */
    public void setCardId(Long cardId) {
        this.cardId = cardId;
    }

    /**
     * @return True if there is a linked card
     */
    public boolean hasCard() {
        return card != null || cardId != null;
    }

    /**
     * @return the card content to which an abstract resource is linked
     */
    public CardContent getCardContent() {
        return cardContent;
    }

    /**
     * @param cardContent the card content to which an abstract resource is linked
     */
    public void setCardContent(CardContent cardContent) {
        this.cardContent = cardContent;
    }

    /**
     * get the id of the card content to which an abstract resource is linked. To be sent to client.
     *
     * @return the ID of the card content
     */
    public Long getCardContentId() {
        if (this.cardContent != null) {
            return cardContent.getId();
        } else {
            return cardContentId;
        }
    }

    /**
     * set the id of the card content to which an abstract resource is linked. For serialization
     * only.
     *
     * @param cardContentId the ID of the card content
     */
    public void setCardContentId(Long cardContentId) {
        this.cardContentId = cardContentId;
    }

    /**
     * @return True if there is a linked card content
     */
    public boolean hasCardContent() {
        return cardContent != null || cardContentId != null;
    }

    /**
     * @return the category to classify the resource
     */
    public String getCategory() {
        return category;
    }

    /**
     * @param category the category to classify the resource
     */
    public void setCategory(String category) {
        this.category = category;
    }

    /**
     * @return the list of resource references that directly link to this abstract resource
     */
    public List<ResourceRef> getDirectReferences() {
        return directReferences;
    }

    /**
     * @param directReferences the list of resource references that directly link to this abstract
     *                         resource
     */
    public void setDirectReferences(List<ResourceRef> directReferences) {
        this.directReferences = directReferences;
    }

    /**
     * @return the list of sticky note links of which the resource is the source
     */
    @Override
    public List<StickyNoteLink> getStickyNoteLinksAsSrc() {
        return stickyNoteLinksAsSrc;
    }

    /**
     * @param stickyNoteLinksAsSrc the list of sticky note links of which the resource is the source
     */
    public void setStickyNoteLinksAsSrc(List<StickyNoteLink> stickyNoteLinksAsSrc) {
        this.stickyNoteLinksAsSrc = stickyNoteLinksAsSrc;
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
     * Resolve to concrete Resource
     *
     * @return the effective resource
     */
    public abstract Resource resolve();

    /**
     * Resolve to concrete resource and return all transitive references too.
     *
     * @return concrete resource and transitive references
     */
    public abstract List<AbstractResource> expand();

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof AbstractResource) {
            AbstractResource o = (AbstractResource) other;
            this.setCategory(o.getCategory());
        } else {
            throw new ColabMergeException(this, other);
        }
    }


    @JsonbTransient
    @Override
    public Conditions.Condition getReadCondition() {
        if (this.abstractCardType != null) {
            // the abstract resource is linked to a card type / card type reference
            return this.abstractCardType.getReadCondition();
        } else if (this.card != null) {
            // the abstract resource is linked to a card
            return new Conditions.HasCardReadRight(this.card);
        } else if (this.cardContent != null) {
            // the abstract resource is linked to a card content
            return this.cardContent.getReadCondition();
        } else {
            // such an orphan shouldn't exist...
            return Conditions.alwaysTrue;
        }
    }


    /**
     * Get the project this content belongs to
     *
     * @return content owner
     */
    @JsonbTransient
    public Project getProject() {
        if (this.abstractCardType != null) {
            // the abstract resource is linked to a card type / card type reference
            return this.abstractCardType.getProject();
        } else if (this.card != null) {
            // the abstract resource is linked to a card
            return this.card.getProject();
        } else if (this.cardContent != null) {
            // the abstract resource is linked to a card content
            return this.cardContent.getProject();
        } else {
            // such an orphan shouldn't exist...
            return null;
        }
    }

    @Override
    public Conditions.Condition getUpdateCondition() {
        if (this.abstractCardType != null) {
            // the abstract resource is linked to a card type / card type reference
            return this.abstractCardType.getUpdateCondition();
        } else if (this.card != null) {
            // the abstract resource is linked to a card
            return this.card.getUpdateCondition();
        } else if (this.cardContent != null) {
            // the abstract resource is linked to a card content
            return this.cardContent.getUpdateCondition();
        } else {
            // such an orphan shouldn't exist...
            return Conditions.alwaysTrue;
        }
    }


    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.abstractCardType != null) {
            // the abstract resource is linked to a card type / card type reference
            return this.abstractCardType.getChannels();
        } else if (this.card != null) {
            // the abstract resource is linked to a card
            return this.card.getChannels();
        } else if (this.cardContent != null) {
            // the abstract resource is linked to a card content
            return this.cardContent.getChannels();
        } else {
            // such an orphan shouldn't exist...
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

    /**
     * @return string representation of its fields
     */
    protected String toPartialString() {
        return "id=" + id + ", abstractCardTypeId=" + getAbstractCardTypeId()
            + ", cardId=" + getCardId() + ", cardContentId=" + getCardContentId()
            + ", category=" + category;
    }

}
