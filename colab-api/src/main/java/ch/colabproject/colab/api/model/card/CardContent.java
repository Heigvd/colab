/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

/**
 * Card content
 *
 * @author sandra
 */
//TODO review accurate constraints when stabilised
@Entity
@NamedQuery(name = "CardContent.findAll", query = "SELECT c from CardContent c")
public class CardContent implements ColabEntity {

    /**
     * Serial version UID
     */
    private static final long serialVersionUID = 1L;

    /**
     * Card content ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Card content title
     */
    private String title;

    /**
     * Card status
     */
    @Enumerated(value = EnumType.STRING)
    private CardContentStatus status;

    /**
     * Card completion level
     */
    @Min(value = 0)
    @Max(value = 100)
    private int completionLevel; // TODO sandra : voir où bloquer entre 0 et 100

    /**
     * Card content completion mode
     */
    @Enumerated(value = EnumType.STRING)
    private CardContentCompletionMode completionMode;

    /**
     * Card
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    // TODO sandra - challenge JsonTransient
    // FIXME sandra - see if there is a need to get the card from the cardcontent
    private Card card;

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
     * @return the completionMode
     */
    public CardContentCompletionMode getCompletionMode() {
        return completionMode;
    }

    /**
     * @param completionMode the new completionMode
     */
    public void setCompletionMode(CardContentCompletionMode completionMode) {
        this.completionMode = completionMode;
    }

    /**
     * @return the card
     */
    public Card getCard() {
        return card;
    }

    /**
     * @param card the new card
     */
    public void setCard(Card card) {
        this.card = card;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof CardContent) {
            CardContent o = (CardContent) other;
            this.setTitle(o.getTitle());
            this.setStatus(o.getStatus());
            this.setCompletionLevel(o.getCompletionLevel());
            this.setCompletionMode(o.getCompletionMode());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.card != null) {
            return this.card.getChannels();
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
        return "CardContent{" + "id=" + id + ", title= " + title + ", status= " + status
            + ", completion= " + completionLevel + ", completionMode= " + completionMode + "}";
    }

}
