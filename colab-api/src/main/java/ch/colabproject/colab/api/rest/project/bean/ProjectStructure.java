/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.project.bean;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import java.util.Set;
import jakarta.validation.constraints.NotNull;

/**
 * Bean to groups the whole project structure
 *
 * @author maxence
 */
@ExtractJavaDoc
public class ProjectStructure {

    /** Id of the root card */
    @NotNull
    private Long rootCardId;

    /** Cards which belong to the project */
    @NotNull
    private Set<Card> cards;

    /** CardContents which belong to the project */
    @NotNull
    private Set<CardContent> cardContents;

    /**
     * Get the value of rootCardId
     *
     * @return the value of rootCardId
     */
    public Long getRootCardId() {
        return rootCardId;
    }

    /**
     * Set the value of rootCardId
     *
     * @param rootCardId new value of rootCardId
     */
    public void setRootCardId(Long rootCardId) {
        this.rootCardId = rootCardId;
    }


    /**
     * Get the value of cardContents
     *
     * @return the value of cardContents
     */
    public Set<CardContent> getCardContents() {
        return cardContents;
    }

    /**
     * Set the value of cardContents
     *
     * @param cardContents new value of cardContents
     */
    public void setCardContents(Set<CardContent> cardContents) {
        this.cardContents = cardContents;
    }


    /**
     * Get the value of cards
     *
     * @return the value of cards
     */
    public Set<Card> getCards() {
        return cards;
    }

    /**
     * Set the value of cards
     *
     * @param cards new value of cards
     */
    public void setCards(Set<Card> cards) {
        this.cards = cards;
    }
}
