/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.card;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 *
 * @author sandra
 */
public class CardControllerTest extends AbstractArquillianTest {

    @Test
    public void testCreateCard() {
        Card card = new Card();

        Long cardId = client.cardController.createCard(card);
        Card persistedCard = client.cardController.getCard(cardId);

        Assertions.assertNotNull(persistedCard);
        Assertions.assertNotNull(persistedCard.getId());

        Assertions.assertEquals(persistedCard.getId(), cardId);
    }

    @Test
    public void testUpdateCard() {
        Card card = new Card();

        Long cardId = client.cardController.createCard(card);
        card = client.cardController.getCard(cardId);
        card.setIndex(3);

        client.cardController.updateCard(card);

        Card card2 = client.cardController.getCard(cardId);
        Assertions.assertEquals(card.getIndex(), card2.getIndex());
    }

    @Test
    public void testGetAllCards() {
        Card card = new Card();
        card.setIndex(1337);
        card.setColor("red");
        client.cardController.createCard(card);

        card = new Card();
        card.setIndex(42);
        card.setColor("purple");
        client.cardController.createCard(card);

        List<Card> cards = client.cardController.getAllCards();
        Assertions.assertEquals(2, cards.size());
    }

    @Test
    public void testDeleteCard() {
        Card card = new Card();
        Long cardId = client.cardController.createCard(card);
        Card persistedCard = client.cardController.getCard(cardId);

        Assertions.assertNotNull(persistedCard);

        client.cardController.deleteCard(cardId);
        persistedCard = client.cardController.getCard(cardId);

        Assertions.assertNull(persistedCard);
    }
}
