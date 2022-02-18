/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.link;

import static ch.colabproject.colab.api.model.link.ActivityFlowLink.LINK_SEQUENCE_NAME;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.model.tracking.Tracking;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.CascadeType;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

/**
 * Link to make an information accessible within a card.
 * <p>
 * The source of information can be either
 * <ul>
 * <li>a card</li>
 * <li>a card content</li>
 * <li>a resource</li>
 * <li>a document</li>
 * </ul>
 *
 * @author sandra
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "destinationcard_id"),
        @Index(columnList = "explanation_id"),
        @Index(columnList = "srccard_id"),
        @Index(columnList = "srccardcontent_id"),
        @Index(columnList = "srcdocument_id"),
        @Index(columnList = "srcresourceorref_id")
    }
)
public class StickyNoteLink implements ColabEntity, WithWebsocketChannels {

    /**
     * Serial version UID
     */
    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * Link ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = LINK_SEQUENCE_NAME)
    private Long id;

    /**
     * creation &amp; modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * The card, source of the sticky note
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private Card srcCard;

    /**
     * The ID of the source card (serialization sugar)
     */
    @Transient
    private Long srcCardId;

    /**
     * The card content, source of the sticky note
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private CardContent srcCardContent;

    /**
     * The ID of the source card content (serialization sugar)
     */
    @Transient
    private Long srcCardContentId;

    /**
     * The resource / resource reference, source of the sticky note
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private AbstractResource srcResourceOrRef;

    /**
     * The ID of the source resource / resource reference (serialization sugar)
     */
    @Transient
    private Long srcResourceOrRefId;

    /**
     * The document, source of the sticky note
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private Document srcDocument;

    /**
     * The ID of the source document (serialization sugar)
     */
    @Transient
    private Long srcDocumentId;

    /**
     * The card where the information is useful
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private Card destinationCard;

    /**
     * The ID of the destination card (serialization sugar)
     */
    @Transient
    private Long destinationCardId;

    /**
     * The short description
     */
    private String teaser;

    /**
     * The long description
     */
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @NotNull
    @JsonbTransient
    private TextDataBlock explanation;

    /**
     * The id of the long description (serialization sugar)
     */
    @Transient
    private Long explanationId;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
    /**
     * @return the link id
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the link id
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the card, source of the sticky note
     */
    public Card getSrcCard() {
        return srcCard;
    }

    /**
     * @param srcCard the card, source of the sticky note
     */
    public void setSrcCard(Card srcCard) {
        this.srcCard = srcCard;
    }

    /**
     * get the id of the source card. To be sent to client
     *
     * @return the id of source card
     */
    public Long getSrcCardId() {
        if (this.srcCard != null) {
            return this.srcCard.getId();
        } else {
            return srcCardId;
        }
    }

    /**
     * set the id of the source card. For serialization only
     *
     * @param srcCardId the id of the source card
     */
    public void setSrcCardId(Long srcCardId) {
        this.srcCardId = srcCardId;
    }

    /**
     * @return True if the source is a card
     */
    public boolean isSrcCard() {
        return this.srcCard != null || this.srcCardId != null;
    }

    /**
     * @return the card content, source of the sticky note
     */
    public CardContent getSrcCardContent() {
        return srcCardContent;
    }

    /**
     * @param srcCardContent the card content, source of the sticky note
     */
    public void setSrcCardContent(CardContent srcCardContent) {
        this.srcCardContent = srcCardContent;
    }

    /**
     * get the id of the source card content. To be sent to client
     *
     * @return the id of source card content
     */
    public Long getSrcCardContentId() {
        if (this.srcCardContent != null) {
            return this.srcCardContent.getId();
        } else {
            return srcCardContentId;
        }
    }

    /**
     * set the id of the source card content. For serialization only
     *
     * @param srcCardContentId the id of the source card content
     */
    public void setSrcCardContentId(Long srcCardContentId) {
        this.srcCardContentId = srcCardContentId;
    }

    /**
     * @return True if the source is a card content
     */
    public boolean isSrcCardContent() {
        return this.srcCardContent != null || this.srcCardContentId != null;
    }

    /**
     * @return the resource / resource reference, source of the sticky note
     */
    public AbstractResource getSrcResourceOrRef() {
        return srcResourceOrRef;
    }

    /**
     * @param srcResourceOrRef the resource / resource reference, source of the sticky note
     */
    public void setSrcResourceOrRef(AbstractResource srcResourceOrRef) {
        this.srcResourceOrRef = srcResourceOrRef;
    }

    /**
     * get the id of the source resource / resource reference. To be sent to client
     *
     * @return the id of source resource / resource reference
     */
    public Long getSrcResourceOrRefId() {
        if (this.srcResourceOrRef != null) {
            return this.srcResourceOrRef.getId();
        } else {
            return srcResourceOrRefId;
        }
    }

    /**
     * set the id of the source resource / resource reference. For serialization only
     *
     * @param srcResourceOrRefId the id of the source resource / resource reference
     */
    public void setSrcResourceOrRefId(Long srcResourceOrRefId) {
        this.srcResourceOrRefId = srcResourceOrRefId;
    }

    /**
     * @return True if the source is a resource / resource reference
     */
    public boolean isSrcResourceOrRef() {
        return this.srcResourceOrRef != null || this.srcResourceOrRefId != null;
    }

    /**
     * @return the document, source of the sticky note
     */
    public Document getSrcDocument() {
        return srcDocument;
    }

    /**
     * @param srcDocument the Document, source of the sticky note
     */
    public void setSrcDocument(Document srcDocument) {
        this.srcDocument = srcDocument;
    }

    /**
     * get the id of the source document. To be sent to client
     *
     * @return the id of source document
     */
    public Long getSrcDocumentId() {
        if (this.srcDocument != null) {
            return this.srcDocument.getId();
        } else {
            return srcDocumentId;
        }
    }

    /**
     * set the id of the source document. For serialization only
     *
     * @param srcDocumentId the id of the source document
     */
    public void setSrcDocumentId(Long srcDocumentId) {
        this.srcDocumentId = srcDocumentId;
    }

    /**
     * @return True if the source is a document
     */
    public boolean isSrcDocument() {
        return this.srcDocument != null || this.srcDocumentId != null;
    }

    /**
     * @return the card where the information is useful
     */
    public Card getDestinationCard() {
        return destinationCard;
    }

    /**
     * @param destinationCard the card where the information is useful
     */
    public void setDestinationCard(Card destinationCard) {
        this.destinationCard = destinationCard;
    }

    /**
     * get the id of the destination card. To be sent to client
     *
     * @return the id of destination card
     */
    public Long getDestinationCardId() {
        if (this.destinationCard != null) {
            return this.destinationCard.getId();
        } else {
            return destinationCardId;
        }
    }

    /**
     * set the id of the destination card. For serialization only
     *
     * @param destinationCardId the id of the destination card
     */
    public void setDestinationCardId(Long destinationCardId) {
        this.destinationCardId = destinationCardId;
    }

    /**
     * @return the short description
     */
    public String getTeaser() {
        return teaser;
    }

    /**
     * @param teaser the short description
     */
    public void setTeaser(String teaser) {
        this.teaser = teaser;
    }

    /**
     * @return the long description
     */
    public TextDataBlock getExplanation() {
        return explanation;
    }

    /**
     * @param explanation the long description
     */
    public void setExplanation(TextDataBlock explanation) {
        this.explanation = explanation;
    }

    /**
     * get the id of the explanation. To be sent to client.
     *
     * @return the id of the explanation
     */
    public Long getExplanationId() {
        if (explanation != null) {
            return explanation.getId();
        } else {
            return explanationId;
        }
    }

    /**
     * set the id of the explanation. For serialization only.
     *
     * @param explanationId the id of the teaser
     */
    public void setExplanationId(Long explanationId) {
        this.explanationId = explanationId;
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
    // helpers
    // ---------------------------------------------------------------------------------------------
    /**
     * @return the source of the link
     */
    @JsonbTransient
    public StickyNoteSourceable getSrc() {
        if (this.srcCard != null) {
            return this.srcCard;
        }
        if (this.srcCardContent != null) {
            return this.srcCardContent;
        }
        if (this.srcResourceOrRef != null) {
            return this.srcResourceOrRef;
        }
        if (this.srcDocument != null) {
            return this.srcDocument;
        }
        throw HttpErrorMessage.dataIntegrityFailure();
    }

    /**
     * @param src the source of the link
     */
    public void setSrc(StickyNoteSourceable src) {
        if (src == null) {
            resetSrc();
        } else if (src instanceof Card) {
            resetSrc();
            setSrcCard((Card) src);
        } else if (src instanceof CardContent) {
            resetSrc();
            setSrcCardContent((CardContent) src);
        } else if (src instanceof AbstractResource) {
            resetSrc();
            setSrcResourceOrRef((AbstractResource) src);
        } else if (src instanceof Document) {
            resetSrc();
            setSrcDocument((Document) src);
        } else {
            throw HttpErrorMessage.dataIntegrityFailure();
        }
    }

    /**
     * Set every source to null
     */
    private void resetSrc() {
        setSrcCard(null);
        setSrcCardId(null);
        setSrcCardContent(null);
        setSrcCardContentId(null);
        setSrcResourceOrRef(null);
        setSrcResourceOrRefId(null);
        setSrcDocument(null);
        setSrcDocumentId(null);
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
    /**
     * {@inheritDoc }
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof StickyNoteLink) {
            StickyNoteLink o = (StickyNoteLink) other;
            this.setTeaser(o.getTeaser());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        return new Conditions.Or(
            this.getSrc().getReadCondition(),
            this.getDestinationCard().getReadCondition()
        );
    }

    @Override
    public Conditions.Condition getUpdateCondition() {
        return this.getSrc().getUpdateCondition();
    }

    /**
     * Get the project it belongs to
     *
     * @return project owner
     */
    public Project getProject() {
        if (this.destinationCard != null) {
            return this.destinationCard.getProject();
        } else {
            // such an orphan shouldn't exist...
            return null;
        }
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.destinationCard != null) {
            return this.destinationCard.getChannels();
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

    @Override
    public String toString() {
        return "StickyNoteLink{" + "id=" + id + ", srcCardId=" + srcCardId
            + ", srcCardContentId=" + srcCardContentId + ", srcResourceOrRefId="
            + srcResourceOrRefId + ", srcDocId=" + srcDocumentId + ", destinationCardId="
            + destinationCardId + ", teaser=" + teaser + "}";
    }

}
