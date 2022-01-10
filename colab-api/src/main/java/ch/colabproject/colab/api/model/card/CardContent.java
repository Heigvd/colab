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
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.Resourceable;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.link.StickyNoteSourceable;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.model.tracking.Tracking;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.CascadeType;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

/**
 * Card content
 *
 * @author sandra
 */
//TODO review accurate constraints when stabilized
@Entity
@Table(
    indexes = {
        @Index(columnList = "card_id"),
        @Index(columnList = "deliverable_id"),
    }
)
@NamedQuery(name = "CardContent.findAll", query = "SELECT c FROM CardContent c")
public class CardContent implements ColabEntity, WithWebsocketChannels,
    Resourceable, StickyNoteSourceable {

    /**
     * Serial version UID
     */
    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * Card content ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = STRUCTURE_SEQUENCE_NAME)
    private Long id;

    /**
     * creation &amp; modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * Title
     */
    private String title;

    /**
     * Status
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    private CardContentStatus status;

    /**
     * A frozen content is read-only
     */
    @NotNull
    private boolean frozen;

    /**
     * Completion level
     */
    // TODO sandra : vérifier si contrainte 0 - 100 ok
    @Min(0)
    @Max(100)
    @NotNull
    private int completionLevel;

    /**
     * Completion mode : how the completion level is filled
     */
    @Enumerated(EnumType.STRING)
    private CardContentCompletionMode completionMode;

    /**
     * The card to which this content belongs
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private Card card;

    /**
     * The card ID (serialization sugar)
     */
    @Transient
    private Long cardId;

    /**
     * The deliverable of this card content
     */
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonbTransient
    private Document deliverable;

    /**
     * The deliverable ID (serialization sugar)
     */
    @Transient
    @JsonbTransient
    private Long deliverableId;

    /**
     * The cards contained in there
     */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<Card> subCards = new ArrayList<>();

    /**
     * The list of abstract resources directly linked to this card content
     */
    @OneToMany(mappedBy = "cardContent", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<AbstractResource> directAbstractResources = new ArrayList<>();

    /**
     * The list of sticky note links of which the card content is the source
     */
    @OneToMany(mappedBy = "srcCardContent", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<StickyNoteLink> stickyNoteLinksAsSrc = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
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
     * @return the status
     */
    public CardContentStatus getStatus() {
        return status;
    }

    /**
     * @param status the new status
     */
    public void setStatus(CardContentStatus status) {
        this.status = status;
    }

    /**
     * Get the value of frozen
     *
     * @return the value of frozen
     */
    public boolean isFrozen() {
        return frozen;
    }

    /**
     * Set the value of frozen
     *
     * @param frozen new value of frozen
     */
    public void setFrozen(boolean frozen) {
        this.frozen = frozen;
    }

    /**
     * @return the completionLevel
     */
    public int getCompletionLevel() {
        return completionLevel;
    }

    /**
     * @param completionLevel the new completionLevel
     */
    public void setCompletionLevel(int completionLevel) {
        this.completionLevel = completionLevel;
    }

    /**
     * @return the completion mode : how the completion level is filled
     */
    public CardContentCompletionMode getCompletionMode() {
        return completionMode;
    }

    /**
     * @param completionMode the new completion mode : how the completion level is filled
     */
    public void setCompletionMode(CardContentCompletionMode completionMode) {
        this.completionMode = completionMode;
    }

    /**
     * @return the card to which this content belongs
     */
    public Card getCard() {
        return card;
    }

    /**
     * @param card the new card to which this content belongs
     */
    public void setCard(Card card) {
        this.card = card;
    }

    /**
     * get the id of the card to which this content belongs. To be sent to client.
     *
     * @return the ID of the card to which this content belongs
     */
    public Long getCardId() {
        if (this.card != null) {
            return card.getId();
        } else {
            return cardId;
        }
    }

    /**
     * set the id of the card to which this content belongs. For serialization only.
     *
     * @param cardId the ID of the card to which this content belongs
     */
    public void setCardId(Long cardId) {
        this.cardId = cardId;
    }

    /**
     * @return the deliverable of this card content
     */
    public Document getDeliverable() {
        return deliverable;
    }

    /**
     * @param deliverable the deliverable of this card content to set
     */
    public void setDeliverable(Document deliverable) {
        this.deliverable = deliverable;
    }

    /**
     * get the id of the deliverable. To be sent to client.
     *
     * @return the id of the deliverable of this card content
     */
    public Long getDeliverableId() {
        if (this.deliverable != null) {
            return this.deliverable.getId();
        } else {
            return deliverableId;
        }
    }

    /**
     * set the id of the deliverable. For serialization only.
     *
     * @param deliverableId the id of the deliverable of this card content to set
     */
    public void setDeliverableId(Long deliverableId) {
        this.deliverableId = deliverableId;
    }

    /**
     * @return the cards contained in there
     */
    public List<Card> getSubCards() {
        return subCards;
    }

    /**
     * @param subCards the cards contained in there
     */
    public void setSubCards(List<Card> subCards) {
        this.subCards = subCards;
    }

    /**
     * @return the list of abstract resources directly linked to this card content
     */
    @Override
    public List<AbstractResource> getDirectAbstractResources() {
        return directAbstractResources;
    }

    /**
     * @param abstractResources the list of abstract resources directly linked to this card content
     */
    public void setDirectAbstractResources(List<AbstractResource> abstractResources) {
        this.directAbstractResources = abstractResources;
    }

    /**
     * @return the list of sticky note links of which the card content is the source
     */
    @Override
    public List<StickyNoteLink> getStickyNoteLinksAsSrc() {
        return stickyNoteLinksAsSrc;
    }

    /**
     * @param stickyNoteLinksAsSrc the list of sticky note links of which the card content is the
     *                             source
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
     * {@inheritDoc}
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof CardContent) {
            CardContent o = (CardContent) other;
            this.setTitle(o.getTitle());
            this.setStatus(o.getStatus());
            this.setCompletionLevel(o.getCompletionLevel());
            this.setCompletionMode(o.getCompletionMode());
            this.setFrozen(o.isFrozen());
            // the deliverable cannot be changed with a merge
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    /**
     * Get the project this content belongs to
     *
     * @return content owner
     */
    @JsonbTransient
    public Project getProject() {
        if (this.card != null) {
            return this.card.getProject();
        }
        return null;
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        // genuine hack inside
        // any member can read any card and card content of the project
        // if a member lacks the read right on a card, it will not be able to read the deliverable,
        // resources and so on, but it will still be able to view the card "from the outside"
        return new Conditions.IsCurrentUserMemberOfProject(getProject());
    }

    @Override
    public Conditions.Condition getUpdateCondition() {
        if (this.card != null) {
            return this.card.getUpdateCondition();
        } else {
            // orphan content should never happen
            return Conditions.defaultForOrphan;
        }
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.card != null) {
            return this.card.getChannels();
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
        return "CardContent{" + "id=" + id + ", title=" + title + ", status=" + status
            + ", completion=" + completionLevel + ", completionMode=" + completionMode
            + ", cardId=" + cardId + "}";
    }

}
