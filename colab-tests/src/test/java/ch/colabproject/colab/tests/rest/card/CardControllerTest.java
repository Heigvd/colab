/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.card;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Unit testing of card controller
 *
 * @author sandra
 */
public class CardControllerTest extends AbstractArquillianTest {

    /// ** logger */
    // private static final Logger logger = LoggerFactory.getLogger(CardControllerTest.class);

    @Test
    public void testCreateCard() {
        String color = "purple " + ((int) (Math.random() * 1000));
        int index = (int) (Math.random() * 100);

        Card card = new Card();
        card.setColor(color);
        card.setIndex(index);
        Long cardId = client.cardController.createCard(card);

        Card persistedCard = client.cardController.getCard(cardId);

        Assertions.assertNotNull(persistedCard);
        Assertions.assertNotNull(persistedCard.getId());

        Assertions.assertEquals(cardId, persistedCard.getId());
        Assertions.assertEquals(color, persistedCard.getColor());
        Assertions.assertEquals(index, persistedCard.getIndex());
    }

    @Test
    public void testUpdateCard() {
        String color = "blue " + ((int) (Math.random() * 1000));
        int index = (int) (Math.random() * 100);

        Card card = new Card();
        Long cardId = client.cardController.createCard(card);

        Card persistedCard1 = client.cardController.getCard(cardId);
        Assertions.assertNull(persistedCard1.getColor());
        Assertions.assertEquals(0, persistedCard1.getIndex());

        persistedCard1.setColor(color);
        persistedCard1.setIndex(index);
        client.cardController.updateCard(persistedCard1);

        Card persistedCard2 = client.cardController.getCard(cardId);
        Assertions.assertEquals(color, persistedCard2.getColor());
        Assertions.assertEquals(index, persistedCard2.getIndex());
    }

    @Test
    public void testGetAllCards() {
        int initialSize = client.cardController.getAllCards().size();

        Card card1 = new Card();
        card1.setIndex(1337);
        card1.setColor("red");
        client.cardController.createCard(card1);

        Card card2 = new Card();
        card2.setIndex(42);
        card2.setColor("yellow");
        client.cardController.createCard(card2);

        List<Card> cards = client.cardController.getAllCards();
        Assertions.assertEquals(initialSize + 2, cards.size());
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

    @Test
    public void testCardContentAccess() {
        String title = "Logo design " + ((int) (Math.random() * 1000));
        int allCardContentsSizeBefore = client.cardContentController.getAllCardContents().size();

        Card card = new Card();
        CardContent cardContent = new CardContent();
        cardContent.setTitle(title);
        card.addCardContent(cardContent);

        Long cardId = client.cardController.createCard(card);

        Card persistedCard = client.cardController.getCard(cardId);
        Assertions.assertNotNull(persistedCard);
        Assertions.assertNotNull(persistedCard.getCardContentVariantList());
        Assertions.assertEquals(1, persistedCard.getCardContentVariantList().size());
        Assertions.assertEquals(title, persistedCard.getCardContentVariantList().get(0).getTitle());

        Assertions.assertEquals(allCardContentsSizeBefore + 1,
                client.cardContentController.getAllCardContents().size());

        Long cardContentId = persistedCard.getCardContentVariantList().get(0).getId();

        CardContent persistedCardContent = client.cardContentController
                .getCardContent(cardContentId);
        Assertions.assertNotNull(persistedCardContent);
        Assertions.assertEquals(title, persistedCardContent.getTitle());

        // FIXME sandra - should it be
        // Assertions.assertEquals(persistedCardContent.getCard(), persistedCard); ?
        // for the moment, the card is not retrieved from a card content, so technically
        // we have
        Assertions.assertNull(persistedCardContent.getCard());
    }
}
