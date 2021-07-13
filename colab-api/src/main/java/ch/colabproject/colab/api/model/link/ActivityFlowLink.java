/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.link;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

/**
 * Link to show that a card must be handled before another one.
 *
 * @author sandra
 */
@Entity
public class ActivityFlowLink implements ColabEntity/* , WithWebsocketChannels */ {

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
     * The card to handle before
     */
    @NotNull
    @ManyToOne
    @JsonbTransient
    private Card previousCard;

    /**
     * The ID of the card to handle before (serialization sugar)
     */
    @Transient
    private Long previousCardId;

    /**
     * The card to handle after
     */
    @NotNull
    @ManyToOne
    @JsonbTransient
    private Card nextCard;

    /**
     * The ID of the card to handle after (serialization sugar)
     */
    @Transient
    private Long nextCardId;

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
     * @return the card to handle before
     */
    public Card getPreviousCard() {
        return previousCard;
    }

    /**
     * @param previousCard the card to handle before
     */
    public void setPreviousCard(Card previousCard) {
        this.previousCard = previousCard;
    }

    /**
     * get the id of the card to handle before. To be sent to client
     *
     * @return the id of the card to handle before
     */
    public Long getPreviousCardId() {
        if (this.previousCard != null) {
            return this.previousCard.getId();
        } else {
            return previousCardId;
        }
    }

    /**
     * set the id of the card to handle before. For serialization only
     *
     * @param previousCardId the id of the card to handle before
     */
    public void setPreviousCardId(Long previousCardId) {
        this.previousCardId = previousCardId;
    }

    /**
     * @return the card to handle after
     */
    public Card getNextCard() {
        return nextCard;
    }

    /**
     * @param nextCard the card to handle after
     */
    public void setNextCard(Card nextCard) {
        this.nextCard = nextCard;
    }

    /**
     * get the id of the card to handle after. To be sent to client
     *
     * @return the id of the card to handle after
     */
    public Long getNextCardId() {
        if (this.nextCard != null) {
            return this.nextCard.getId();
        } else {
            return nextCardId;
        }
    }

    /**
     * set the id of the card to handle after. For serialization only
     *
     * @param nextCardId the id of the card to handle after
     */
    public void setNextCardId(Long nextCardId) {
        this.nextCardId = nextCardId;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    /**
     * {@inheritDoc }
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
//        if (other instanceof ActivityFlowLink) {
        // ActivityFlowLink o = (ActivityFlowLink) other;
        // previousCard is managed separately in the Facade
        // nextCard is managed separately in the Facade
//        } else {
        if (!(other instanceof ActivityFlowLink)) {
            throw new ColabMergeException(this, other);
        }
    }

//    @Override
//    public Set<WebsocketChannel> getChannels() {
//        if (this.nextCard != null) {
//            return this.nextCard.getChannels();
//        } else {
//        return Set.of();
//        }
//    }

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
        return "ActivityFlowLink{" + "id=" + id + ", previousCardId=" + getPreviousCardId()
            + ", nextCardId=" + getNextCardId() + "}";
    }

}
