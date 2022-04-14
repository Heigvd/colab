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
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.model.tracking.Tracking;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.EmptyChannelBuilder;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

/**
 * Link to show that a card must be handled before another one.
 *
 * @author sandra
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "nextcard_id"),
        @Index(columnList = "previouscard_id"), }
)
public class ActivityFlowLink implements ColabEntity, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    /** Link sequence name */
    public static final String LINK_SEQUENCE_NAME = "link_seq";

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * Link ID
     */
    @Id
    @SequenceGenerator(name = LINK_SEQUENCE_NAME, allocationSize = 20)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = LINK_SEQUENCE_NAME)
    private Long id;

    /**
     * creation + modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * The card to handle before
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
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
    @ManyToOne(fetch = FetchType.LAZY)
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

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (!(other instanceof ActivityFlowLink)) {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public ChannelsBuilder getChannelBuilder() {
        if (this.nextCard != null) {
            return this.nextCard.getChannelBuilder();
        } else {
            // such an orphan shouldn't exist...
            return new EmptyChannelBuilder();
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        return new Conditions.Or(
            new Conditions.HasCardReadRight(this.previousCard),
            new Conditions.HasCardReadRight(this.nextCard)
        );
    }

    // TODO what is best : And / Or ?
    @Override
    public Conditions.Condition getUpdateCondition() {
        return new Conditions.Or(
            this.previousCard.getUpdateCondition(),
            this.nextCard.getUpdateCondition()
        );
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
        return "ActivityFlowLink{" + "id=" + id + ", previousCardId=" + previousCardId
            + ", nextCardId=" + nextCardId + "}";
    }

}
