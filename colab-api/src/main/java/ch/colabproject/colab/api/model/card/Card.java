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
import java.util.ArrayList;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;

/**
 * Card
 *
 * @author sandra
 */
// TODO review accurate constraints when stabilised
@Entity
@NamedQuery(name = "Card.findAll", query = "SELECT c from Card c")
public class Card implements ColabEntity {

    /**
     * Serial version UID
     */
    private static final long serialVersionUID = 1L;

    /**
     * Card ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The index of the card in its parent
     */
    private int index;

    /**
     * The color of the card
     */
    private String color;

    /**
     * card def
     */
    // TODO sandra - challenge the fetch type
    @ManyToOne
    private CardDef cardDef;

    /**
     * The list of variants of card content
     */
    // TODO sandra - see where it is suitable to order it
    // TODO sandra - challenge cascade
    // TODO sandra - challenge ArrayList
    // TODO sandra - challenge JsonTransient
    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ArrayList<CardContent> cardContentVariantList = new ArrayList<>();

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
     * @return the index of the card in its parent
     */
    public int getIndex() {
        return index;
    }

    /**
     * @param index the new index of the card in its parent
     */
    public void setIndex(int index) {
        this.index = index;
    }

    /**
     * @return the color of the card
     */
    public String getColor() {
        return color;
    }

    /**
     * @param color the new color of the card
     */
    public void setColor(String color) {
        this.color = color;
    }

    /**
     * @return the cardDef
     */
    public CardDef getCardDef() {
        return cardDef;
    }

    /**
     * @param cardDef the new cardDef
     */
    public void setCardDef(CardDef cardDef) {
        this.cardDef = cardDef;
    }

    /**
     * @return the list of variants of card content
     */
    public List<CardContent> getCardContentVariantList() {
        return cardContentVariantList;
    }

    /**
     * @param variantList the list of variants of card content
     */
    public void setCardContentVariantList(ArrayList<CardContent> variantList) {
        this.cardContentVariantList = variantList;
    }

    /**
     * Add a card content to the list of variants of card content
     *
     * @param cardContent the card content to add
     */
    public void addCardContent(CardContent cardContent) {
        cardContentVariantList.add(cardContent);
        cardContent.setCard(this);
    }

    /**
     * Remove a card content from the list of variants of card content
     *
     * @param cardContent the card content to remove
     */
    public void removeCardContent(CardContent cardContent) {
        cardContentVariantList.remove(cardContent);
        cardContent.setCard(null);
    }

    /**
     * {@inheritDoc }
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof Card) {
            Card o = (Card) other;
            this.setIndex(o.getIndex());
            this.setColor(o.getColor());
        } else {
            throw new ColabMergeException(this, other);
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
        return "Card{" + "id=" + id + ", index=" + index + ", color=" + color + "}";
    }

}
