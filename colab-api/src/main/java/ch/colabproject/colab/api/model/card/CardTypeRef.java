/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import java.util.ArrayList;
import java.util.List;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.FetchType;
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
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private AbstractCardType abstractCardType;

    /**
     * The id of the type this reference references (serialization sugar)
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
        return this.abstractCardType;
    }

    /**
     * @param cardType the new referenced type
     */
    public void setAbstractCardType(AbstractCardType cardType) {
        this.abstractCardType = cardType;
    }

    /**
     * get the cardType id. To be sent to client
     *
     * @return id of the abstractCardType or null
     */
    public Long getAbstractCardTypeId() {
        if (this.abstractCardType != null) {
            return this.abstractCardType.getId();
        } else {
            return cardTypeId;
        }
    }

    /**
     * set the cardType id. For serialization only
     *
     * @param id the id of the abstractCardType
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
     * @return the abstractCardType
     */
    @Override
    public CardType resolve() {
        if (this.abstractCardType instanceof CardType) {
            return (CardType) this.abstractCardType;
        } else if (this.abstractCardType instanceof CardTypeRef) {
            return ((CardTypeRef) abstractCardType).resolve();
        }
        return null;
    }

    @Override
    public List<AbstractCardType> expand() {
        List<AbstractCardType> list = new ArrayList<>();

        list.add(this);
        if (this.abstractCardType != null) {
            list.addAll(this.abstractCardType.expand());
        }
        return list;
    }

    @Override
    public String toString() {
        return "CardTypeRef{"
            + "id=" + getId()
            + ", cardTypeId=" + cardTypeId + '}';
    }
}
