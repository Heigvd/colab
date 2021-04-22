/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.card;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardDef;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Unit testing of card controller from a client point of view
 *
 * @author sandra
 */
public class CardControllerTest extends AbstractArquillianTest {

    // ** logger */
    // private static final Logger logger =
    // LoggerFactory.getLogger(CardControllerTest.class);

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
        String color = "soft blue " + ((int) (Math.random() * 1000));

        Card card = new Card();
        card.setColor(color);

        CardContent cardContent = new CardContent();
        cardContent.setTitle(title);
        cardContent.setCard(card);
        card.getContentVariants().add(cardContent);
        Long cardId = client.cardController.createCard(card);
        cardContent.setCardId(cardId);
        Long cardContentId = client.cardContentController.createCardContent(cardContent);

        CardContent persistedCardContent = client.cardContentController
                .getCardContent(cardContentId);
        Assertions.assertNotNull(persistedCardContent);
        Assertions.assertEquals(title, persistedCardContent.getTitle());
        Assertions.assertEquals(cardId, persistedCardContent.getCardId());

        Card persistedCard = client.cardController.getCard(cardId);
        Assertions.assertNotNull(persistedCard);
        Assertions.assertEquals(color, persistedCard.getColor());

        // TODO make the link work between card and card content
//        List<CardContent> contentVariants = client.cardController.getContentVariantsOfCard(cardId);
//        Assertions.assertNotNull(contentVariants);
//        Assertions.assertEquals(1, contentVariants.size());
//        Assertions.assertEquals(cardContentId, contentVariants.get(0).getId());
    }

    @Test
    public void SubCardAccess() {
        String title = "Training " + ((int) (Math.random() * 1000));
        String color = "hell brown " + ((int) (Math.random() * 1000));

        CardContent cardContent = new CardContent();
        cardContent.setTitle(title);
        Long cardContentId = client.cardContentController.createCardContent(cardContent);

        CardContent persistedCardContent = client.cardContentController
                .getCardContent(cardContentId);
        Assertions.assertNotNull(persistedCardContent);

        Card card = new Card();
        card.setColor(color);
        card.setParent(persistedCardContent);
        card.setParentId(cardContentId);
        Long cardId = client.cardController.createCard(card);

        Card persistedCard = client.cardController.getCard(cardId);
        persistedCardContent.getSubCards().add(persistedCard);
        client.cardContentController.updateCardContent(persistedCardContent);

        // TODO make the link work between card and card content
//        List<Card> subCards = client.cardContentController.getSubCards(cardContentId);
//        Assertions.assertNotNull(subCards);
//        Assertions.assertEquals(1, subCards.size());
//        Assertions.assertEquals(cardId, subCards.get(0).getId());
//
//       // Card persistedCard = client.cardController.getCard(cardId);
//        Assertions.assertNotNull(persistedCard);
//        Assertions.assertEquals(color, persistedCard.getColor());
//        Assertions.assertEquals(cardContentId, persistedCard.getParentId());
    }

    @Test
    public void testCardDefAccess() {
        String cardDefTitle = "communication " + ((int) (Math.random() * 1000));
        String color = "violet " + ((int) (Math.random() * 1000));

        CardDef cardDef = new CardDef();
        cardDef.setTitle(cardDefTitle);
        Long cardDefId = client.cardDefController.createCardDef(cardDef);

        CardDef persistedCardDef = client.cardDefController.getCardDef(cardDefId);

        Card card = new Card();
        card.setColor(color);
        card.setCardDefinition(persistedCardDef);
        Long cardId = client.cardController.createCard(card);

        Card persistedCard = client.cardController.getCard(cardId);
        Assertions.assertNotNull(persistedCard);
        Assertions.assertNotNull(persistedCard.getCardDefinitionId());
        Assertions.assertEquals(cardDefId, persistedCard.getCardDefinitionId());
    }
}
