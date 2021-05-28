/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.Transient;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

/**
 * Card content
 *
 * @author sandra
 */
//TODO review accurate constraints when stabilized
@Entity
@NamedQuery(name = "CardContent.findAll", query = "SELECT c FROM CardContent c")
public class CardContent implements ColabEntity, WithWebsocketChannels {

    /**
     * Serial version UID
     */
    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Card content ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Title
     */
    private String title;

    /**
     * Status
     */
    @Enumerated(EnumType.STRING)
    private CardContentStatus status;

    /**
     * Completion level
     */
    // TODO sandra : vérifier si contrainte 0 - 100 ok
    @Min(0)
    @Max(100)
    private int completionLevel;

    /**
     * Completion mode : how the completion level is filled
     */
    @Enumerated(EnumType.STRING)
    private CardContentCompletionMode completionMode;

    /**
     * The card to which this content belongs
     */
    @ManyToOne
    @JsonbTransient
    private Card card;

    /**
     * The card ID (serialization sugar)
     */
    @Transient
    private Long cardId;

    /**
     * The cards contained in there
     */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<Card> subCards = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

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
     * @return the completion mode : how the completion level is filled
     */
    public CardContentCompletionMode getCompletionMode() {
        return completionMode;
    }

    /**
     * @param completionMode the new completion mode : how the completion level is
     *        filled
     */
    public void setCompletionMode(CardContentCompletionMode completionMode) {
        this.completionMode = completionMode;
    }

    /**
     * @return the card to which this content belongs
     */
    public Card getCard() {
        return card;
    }

    /**
     * @param card the new card to which this content belongs
     */
    public void setCard(Card card) {
        this.card = card;
    }

    /**
     * @return the ID of the card to which this content belongs
     */
    public Long getCardId() {
        if (this.card != null) {
            return card.getId();
        } else {
            return cardId;
        }
    }

    /**
     * @param cardId the ID of the card to which this content belongs
     */
    public void setCardId(Long cardId) {
        this.cardId = cardId;
    }

    /**
     * @return the cards contained in there
     */
    public List<Card> getSubCards() {
        return subCards;
    }

    /**
     * @param subCards the cards contained in there
     */
    public void setSubCards(List<Card> subCards) {
        this.subCards = subCards;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

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

    /**
     * Get the project this content belongs to
     *
     * @return content owner
     */
    @JsonbTransient
    public Project getProject(){
        if (this.card != null){
            return this.card.getProject();
        }
        return null;
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
        return "CardContent{" + "id=" + id + ", title=" + title + ", status=" + status
                + ", completion=" + completionLevel + ", completionMode=" + completionMode
                + ", card=" + card + "}";
    }

}
