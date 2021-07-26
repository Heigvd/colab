/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.link;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Transient;

/**
 * Link to make an information accessible within a card.
 * <p>
 * The source of information can be either
 * <ul>
 * <li>a card</li>
 * <li>a card content</li>
 * <li>a resource</li>
 * <li>a block</li>
 * </ul>
 *
 * @author sandra
 */
@Entity
public class StickyNoteLink implements ColabEntity , WithWebsocketChannels {

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The card, source of the sticky note
     */
    @ManyToOne
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
    @ManyToOne
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
    @ManyToOne
    @JsonbTransient
    private AbstractResource srcResourceOrRef;

    /**
     * The ID of the source resource / resource reference (serialization sugar)
     */
    @Transient
    private Long srcResourceOrRefId;

    /**
     * The block, source of the sticky note
     */
    @ManyToOne
    @JsonbTransient
    private Block srcBlock;

    /**
     * The ID of the source block (serialization sugar)
     */
    @Transient
    private Long srcBlockId;

    /**
     * The card where the information is useful
     */
    @ManyToOne
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
    private String explanation;

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
     * @return the block, source of the sticky note
     */
    public Block getSrcBlock() {
        return srcBlock;
    }

    /**
     * @param srcBlock the block, source of the sticky note
     */
    public void setSrcBlock(Block srcBlock) {
        this.srcBlock = srcBlock;
    }

    /**
     * get the id of the source block. To be sent to client
     *
     * @return the id of source block
     */
    public Long getSrcBlockId() {
        if (this.srcBlock != null) {
            return this.srcBlock.getId();
        } else {
            return srcBlockId;
        }
    }

    /**
     * set the id of the source block. For serialization only
     *
     * @param srcBlockId the id of the source block
     */
    public void setSrcBlockId(Long srcBlockId) {
        this.srcBlockId = srcBlockId;
    }

    /**
     * @return True if the source is a block
     */
    public boolean isSrcBlock() {
        return this.srcBlock != null || this.srcBlockId != null;
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
    public String getExplanation() {
        return explanation;
    }

    /**
     * @param explanation the long description
     */
    public void setExplanation(String explanation) {
        this.explanation = explanation;
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
        if (this.srcBlock != null) {
            return this.srcBlock;
        }
        throw HttpErrorMessage.dataIntegrityFailure();
    }

    /**
     * @param src the source of the link
     */
    public void setSrc(StickyNoteSourceable src) {
        if (src == null) {
            resetSrc();
            return;
        }
        if (src instanceof Card) {
            resetSrc();
            setSrcCard((Card) src);
            return;
        }
        if (src instanceof CardContent) {
            resetSrc();
            setSrcCardContent((CardContent) src);
            return;
        }
        if (src instanceof AbstractResource) {
            resetSrc();
            setSrcResourceOrRef((AbstractResource) src);
            return;
        }
        if (src instanceof Block) {
            resetSrc();
            setSrcBlock((Block) src);
            return;
        }
        throw HttpErrorMessage.dataIntegrityFailure();
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
        setSrcBlock(null);
        setSrcBlockId(null);
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
            // srcXxx is managed separately in the Facade
            // destinationYyy is managed separately in the Facade
            this.setTeaser(o.getTeaser());
            this.setExplanation(o.getExplanation());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.destinationCard != null) {
            return this.destinationCard.getChannels();
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
        return "StickyNoteLink{" + "id=" + id + ", srcCardId=" + getSrcCardId()
            + ", srcCardContentId=" + getSrcCardContentId() + ", srcResourceOrRefId="
            + getSrcResourceOrRefId() + ", srcBlockId=" + getSrcBlockId() + ", destination="
            + destinationCard + ", teaser=" + teaser + ", explanation=" + explanation + "}";
    }

}
