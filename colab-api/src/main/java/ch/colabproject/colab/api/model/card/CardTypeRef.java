/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import java.util.ArrayList;
import java.util.List;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Index;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

/**
 * Reference to another existing abstract card type.
 *
 * @author maxence
 * @author sandra
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "target_id"),
    }
)
@NamedQuery(name = "CardTypeRef.findTargetIds",
    query = "SELECT ctr.target.id FROM CardTypeRef ctr WHERE ctr.id IN :initIds")
@NamedQuery(name = "CardTypeRef.findDirectReferences",
    query = "SELECT ctr FROM CardTypeRef ctr "
        + "WHERE ctr.target IS NOT NULL AND ctr.target.id = :targetId")
@NamedQuery(name = "CardTypeRef.findDirectReferencesIds",
    query = "SELECT ctr.id FROM CardTypeRef ctr "
        + "WHERE ctr.target IS NOT NULL AND ctr.target.id IN :initIds")
public class CardTypeRef extends AbstractCardType {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The abstract card type this reference aims at
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JsonbTransient
    private AbstractCardType target;

    /**
     * The id of the abstract card type this reference aims at (serialization sugar)
     */
    @Transient
    private Long targetId;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * get the card type (or card type reference) this reference aims at
     *
     * @return the referenced type
     */
    public AbstractCardType getTarget() {
        return this.target;
    }

    /**
     * @param target the card type (or card type reference) this reference aims at
     */
    public void setTarget(AbstractCardType target) {
        this.target = target;
    }

    /**
     * get the id of the card type (or card type reference) this reference aims at. To be sent to
     * client
     *
     * @return id of the abstractCardType or null
     */
    public Long getTargetId() {
        if (this.target != null) {
            return this.target.getId();
        } else {
            return targetId;
        }
    }

    /**
     * set the id of the card type (or card type reference) this reference aims at. For
     * serialization only
     *
     * @param id the id of the abstractCardType
     */
    public void setTargetId(Long id) {
        this.targetId = id;
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
        if (this.target == null) {
            return null;
        }

        return this.target.resolve();
    }

    @Override
    public List<AbstractCardType> expand() {
        List<AbstractCardType> list = new ArrayList<>();

        list.add(this);
        if (this.target != null) {
            list.addAll(this.target.expand());
        }
        return list;
    }

    @Override
    public String toString() {
        return "CardTypeRef{"
            + "id=" + getId() + ", deletion=" + getDeletionStatus()
            + ", targetId=" + targetId + '}';
    }

}
