/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.ws.channel.ProjectContentChannel;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Transient;

/**
 * Reference to Card type
 *
 * @author maxence
 */
@Entity
public class CardTypeRef extends AbstractCardType {

    /**
     * Serial version UID
     */
    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * The type this reference references
     */
    @ManyToOne
    @JsonbTransient
    private AbstractCardType cardType;

    /**
     * The id of the project (serialization sugar)
     */
    @Transient
    private Long cardTypeId;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
    /**
     * get the type this ref references.
     *
     * @return the referenced type
     */
    public AbstractCardType getAbstractCardType() {
        return this.cardType;
    }

    /**
     * @param cardType the new referenced type
     */
    public void setAbstractCardType(AbstractCardType cardType) {
        this.cardType = cardType;
    }

    /**
     * get the cardType id. To be sent to client
     *
     * @return id of the cardType or null
     */
    public Long getAbstractCardTypeId() {
        if (this.cardType != null) {
            return this.cardType.getId();
        } else {
            return cardTypeId;
        }
    }

    /**
     * set the cardType id. For serialization only
     *
     * @param id the id of the cardType
     */
    public void setAbstractCardTypeId(Long id) {
        this.cardTypeId = id;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
    /**
     * Resolve the reference.
     *
     * @return the cardType
     */
    @Override
    public CardType resolve() {
        if (this.cardType instanceof CardType) {
            return (CardType) this.cardType;
        } else if (this.cardType instanceof CardTypeRef) {
            return ((CardTypeRef) cardType).resolve();
        }
        return null;
    }

    /**
     * {@inheritDoc }
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof CardTypeRef == false) {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.getProject() != null) {
            return Set.of(ProjectContentChannel.build(this.getProject()));
        } else {
            return Set.of();
        }
    }

    @Override
    public String toString() {
        return "CardTypeRef{"
            + "id=" + this.getId()
            + ", cardType=" + cardType
            + ", cardTypeId=" + cardTypeId + '}';
    }
}
