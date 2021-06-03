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
import javax.persistence.ManyToOne;
import javax.persistence.Transient;

/**
 * Reference to Card definition
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
     * The definition this reference references
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

    @Override
    public List<AbstractCardType> expand() {
        List list = new ArrayList<>();

        list.add(this);
        if (this.cardType != null) {
            list.addAll(this.cardType.expand());
        }
        return list;
    }

    @Override
    public String toString() {
        return "CardTypeRef{"
            + "id=" + this.getId()
            + ", cardType=" + cardType
            + ", cardTypeId=" + cardTypeId + '}';
    }
}
