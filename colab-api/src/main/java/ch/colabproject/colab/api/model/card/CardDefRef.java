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
 * Reference to Card definition
 *
 * @author maxence
 */
@Entity
public class CardDefRef extends AbstractCardDef {

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
    private AbstractCardDef cardDef;

    /**
     * The id of the project (serialization sugar)
     */
    @Transient
    private Long cardDefId;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
    /**
     * get the type this ref references.
     *
     * @return the referenced type
     */
    public AbstractCardDef getAbstractCardDef() {
        return this.cardDef;
    }

    /**
     * @param cardDef the new referenced type
     */
    public void setAbstractCardDef(AbstractCardDef cardDef) {
        this.cardDef = cardDef;
    }

    /**
     * get the cardDef id. To be sent to client
     *
     * @return id of the cardDef or null
     */
    public Long getAbstractCardDefId() {
        if (this.cardDef != null) {
            return this.cardDef.getId();
        } else {
            return cardDefId;
        }
    }

    /**
     * set the cardDef id. For serialization only
     *
     * @param id the id of the cardDef
     */
    public void setAbstractCardDefId(Long id) {
        this.cardDefId = id;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
    /**
     * Resolve the reference.
     *
     * @return the cardDef
     */
    @Override
    public CardDef resolve() {
        if (this.cardDef instanceof CardDef) {
            return (CardDef) this.cardDef;
        } else if (this.cardDef instanceof CardDefRef) {
            return ((CardDefRef) cardDef).resolve();
        }
        return null;
    }

    /**
     * {@inheritDoc }
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof CardDefRef == false) {
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
        return "CardDefRef{"
            + "id=" + this.getId()
            + ", cardDef=" + cardDef
            + ", cardDefId=" + cardDefId + '}';
    }
}
