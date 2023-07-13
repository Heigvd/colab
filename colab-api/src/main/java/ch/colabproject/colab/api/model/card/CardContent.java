/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import static ch.colabproject.colab.api.model.card.Card.STRUCTURE_SEQUENCE_NAME;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.common.ConversionStatus;
import ch.colabproject.colab.api.model.common.DeletionStatus;
import ch.colabproject.colab.api.model.common.Tracking;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.Resourceable;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.link.StickyNoteSourceable;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.EmptyChannelBuilder;
import java.util.ArrayList;
import java.util.List;
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
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * Card content
 *
 * @author sandra
 */
@Entity
@Table(indexes = {
    @Index(columnList = "card_id"), })
public class CardContent implements ColabEntity, WithWebsocketChannels,
    Resourceable, StickyNoteSourceable {

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
     * creation + modification + erasure tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * Is it in a bin or ready to be definitely deleted. Null means active.
     */
    @Enumerated(EnumType.STRING)
    private DeletionStatus deletionStatus;

    /**
     * Title
     */
    @Size(max = 255)
    private String title;

    /**
     * Status
     */
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
     * Conversion status : has the deliverable content been converted
     */
    @Enumerated(EnumType.STRING)
    private ConversionStatus lexicalConversion;

    /**
     * The card to which this content belongs
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JsonbTransient
    private Card card;

    /**
     * The card ID (serialization sugar)
     */
    @Transient
    private Long cardId;

    /**
     * The deliverables of this card content
     */
    @OneToMany(mappedBy = "owningCardContent", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<Document> deliverables = new ArrayList<>();

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

    @Override
    public DeletionStatus getDeletionStatus() {
        return deletionStatus;
    }

    @Override
    public void setDeletionStatus(DeletionStatus status) {
        this.deletionStatus = status;
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
     * @return the conversion status : conversion status of deliverables for lexical
     */
    public ConversionStatus getLexicalConversion() {
        return lexicalConversion;
    }

    /**
     * @param lexicalConversion the new conversion status : conversion status of deliverables for
     *                          lexical
     */
    public void setLexicalConversion(ConversionStatus lexicalConversion) {
        this.lexicalConversion = lexicalConversion;
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
     * @return the deliverables of this card content
     */
    public List<Document> getDeliverables() {
        return deliverables;
    }

    /**
     * @param deliverables the deliverables of this card content
     */
    public void setDeliverables(List<Document> deliverables) {
        this.deliverables = deliverables;
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

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
    @Override
    public void mergeToUpdate(ColabEntity other) throws ColabMergeException {
        if (other instanceof CardContent) {
            CardContent o = (CardContent) other;
            this.setDeletionStatus(o.getDeletionStatus());
            this.setTitle(o.getTitle());
            this.setStatus(o.getStatus());
            this.setFrozen(o.isFrozen());
            this.setCompletionLevel(o.getCompletionLevel());
            this.setCompletionMode(o.getCompletionMode());
            // lexicalConversion must not be merged nor duplicated
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
    public ChannelsBuilder getChannelsBuilder() {
        if (this.card != null) {
            return this.card.getChannelsBuilder();
        } else {
            // such an orphan shouldn't exist...
            return new EmptyChannelBuilder();
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        // genuine hack inside
        // any member can read any card and card content of the project
        // if a member lacks the read right on a card, it will not be able to read the
        // deliverables,
        // resources and so on, but it will still be able to view the card "from the
        // outside"
        return new Conditions.IsCurrentUserMemberOfProject(getProject());
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getUpdateCondition() {
        if (this.card != null) {
            return this.card.getUpdateCondition();
        } else {
            // orphan content should never happen
            return Conditions.defaultForOrphan;
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
        return "CardContent{" + "id=" + id + ", deletion=" + getDeletionStatus()
            + ", title=" + title + ", status=" + status
            + ", completion=" + completionLevel + ", completionMode=" + completionMode
            + ", lexicalConversion=" + lexicalConversion
            + ", frozen=" + frozen + ", cardId=" + cardId + "}";
    }

}
