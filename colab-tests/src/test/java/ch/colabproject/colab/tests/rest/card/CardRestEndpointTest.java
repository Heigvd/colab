/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.card;

import ch.colabproject.colab.api.controller.card.grid.GridPosition;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.ExternalLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of card controller from a client point of view
 *
 * @author sandra
 */
public class CardRestEndpointTest extends AbstractArquillianTest {

    @Test
    public void testCreateCard() {
        Project project = ColabFactory.createProject(client, "testCreateCard");
        Long projectId = project.getId();

        CardType cardType = ColabFactory.createCardType(client, projectId);
        Long cardTypeId = cardType.getId();

        Long parentId = ColabFactory.getRootContent(client, project).getId();

        Card card = client.cardRestEndpoint.createNewCard(parentId, cardTypeId);
        Long cardId = card.getId();

        Assertions.assertNotNull(card);
        Assertions.assertNotNull(card.getId());
        Assertions.assertNull(card.getColor());
        Assertions.assertEquals(1, card.getX()); // first card take the first cell
        Assertions.assertEquals(1, card.getY());
        Assertions.assertEquals(parentId, card.getParentId());
        Assertions.assertEquals(cardTypeId, card.getCardTypeId());

        List<CardContent> variants = client.cardRestEndpoint.getContentVariantsOfCard(cardId);
        Assertions.assertNotNull(variants);
        Assertions.assertEquals(1, variants.size());
        Assertions.assertEquals(cardId, variants.get(0).getCardId());
        Assertions.assertNotEquals(parentId, variants.get(0).getId());

        Document newDoc = new ExternalLink();

        card = client.cardRestEndpoint.createNewCardWithDeliverable(parentId, cardTypeId, newDoc);
        cardId = card.getId();

        Assertions.assertNotNull(card);
        Assertions.assertNotNull(card.getId());
        Assertions.assertNull(card.getColor());
        Assertions.assertEquals(2, card.getX());
        Assertions.assertEquals(1, card.getY());
        Assertions.assertEquals(parentId, card.getParentId());
        Assertions.assertEquals(cardTypeId, card.getCardTypeId());

        variants = client.cardRestEndpoint.getContentVariantsOfCard(cardId);
        Assertions.assertNotNull(variants);
        Assertions.assertEquals(1, variants.size());
        Assertions.assertEquals(cardId, variants.get(0).getCardId());
        Assertions.assertNotEquals(parentId, variants.get(0).getId());

        List<Document> documents = client.cardContentRestEndpoint.getDeliverablesOfCardContent(variants.get(0).getId());
        Assertions.assertNotNull(documents);
        Assertions.assertEquals(1, documents.size());
        Document doc = documents.get(0);
        Assertions.assertNotNull(doc);
        Assertions.assertNotNull(doc.getId());
        Assertions.assertTrue(doc instanceof ExternalLink);
    }

    @Test
    public void testUpdateCard() {
        Project project = ColabFactory.createProject(client, "testUpdateCard");

        Card card = ColabFactory.createNewCard(client, project);
        Long cardId = card.getId();

        Assertions.assertNull(card.getColor());
        Assertions.assertEquals(1, card.getX());

        String color = "blue " + ((int) (Math.random() * 1000));
        int index = (int) (Math.random() * 100);

        card.setColor(color);
        card.setX(index);
        client.cardRestEndpoint.updateCard(card);

        Card persistedCard = client.cardRestEndpoint.getCard(cardId);
        // color has been updated
        Assertions.assertEquals(color, persistedCard.getColor());
        // position has not been updated
        Assertions.assertEquals(1, persistedCard.getX());
    }


    @Test
    public void testMoveCards() {
        Project project = ColabFactory.createProject(client, "testUpdateCard");

        Card card = ColabFactory.createNewCard(client, project);
        Long cardId = card.getId();

        Assertions.assertEquals(1, card.getX());
        Assertions.assertEquals(1, card.getY());
        Assertions.assertEquals(1, card.getWidth());
        Assertions.assertEquals(1, card.getHeight());

        client.cardRestEndpoint.changeCardPosition(card.getId(), new GridPosition(2, 3, 4, 5));

        Card persistedCard = client.cardRestEndpoint.getCard(cardId);

        Assertions.assertEquals(1, persistedCard.getX()); // shifted to start at (1;1)
        Assertions.assertEquals(1, persistedCard.getY());
        Assertions.assertEquals(4, persistedCard.getWidth());
        Assertions.assertEquals(5, persistedCard.getHeight());


        Card otherCard = ColabFactory.createNewCard(client, project);
        Long otherCardId = card.getId();

        Assertions.assertEquals(1, otherCard.getX());
        Assertions.assertEquals(6, otherCard.getY());
        Assertions.assertEquals(1, otherCard.getWidth());
        Assertions.assertEquals(1, otherCard.getHeight());
    }

    @Test
    public void testDeleteCard() {
        Project project = ColabFactory.createProject(client, "testDeleteCard");

        Card card = ColabFactory.createNewCard(client, project);
        Long cardId = card.getId();

        Card persistedCard = client.cardRestEndpoint.getCard(cardId);
        Assertions.assertNotNull(persistedCard);

        client.cardRestEndpoint.deleteCard(cardId);

        persistedCard = client.cardRestEndpoint.getCard(cardId);
        Assertions.assertNull(persistedCard);
    }

    @Test
    public void testCardWithoutType() {
        Project project = ColabFactory.createProject(client, "testCardWithoutType");

        Long parentId = ColabFactory.getRootContent(client, project).getId();

        Card card = ColabFactory.createNewCard(client, parentId);

        Assertions.assertNotNull(card);
        Assertions.assertNull(card.getCardTypeId());

        Long card2Id = ColabFactory.createNewCard(client, project).getId();
        Long cardContent2Id = ColabFactory.getCardContent(client, card2Id).getId();

        client.cardRestEndpoint.moveCard(card.getId(), cardContent2Id);

        client.cardRestEndpoint.deleteCard(card.getId());
    }

    @Test
    public void testMoveCard() {
        Project project = ColabFactory.createProject(client, "testMoveCard");

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        Long card1Id = ColabFactory.createNewCard(client, project).getId();
        Long cardContent1Id = ColabFactory.getCardContent(client, card1Id).getId();

        Card card2 = ColabFactory.createNewCard(client, project);
        Long card2Id = card2.getId();

        Card persistedCard2 = client.cardRestEndpoint.getCard(card2Id);
        Assertions.assertEquals(rootCardContentId, persistedCard2.getParentId());

        client.cardRestEndpoint.moveCard(card2Id, cardContent1Id);

        persistedCard2 = client.cardRestEndpoint.getCard(card2Id);
        Assertions.assertEquals(cardContent1Id, persistedCard2.getParentId());
    }

    @Test
    public void testSubCardAccess() {
        Project project = ColabFactory.createProject(client, "testSubCardAccess");
        Long projectId = project.getId();

        CardType cardType = ColabFactory.createCardType(client, projectId);
        Long cardTypeId = cardType.getId();

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        Card card = ColabFactory.createNewCard(client, rootCardContentId, cardTypeId);
        Long cardId = card.getId();

        Assertions.assertEquals(rootCardContentId, card.getParentId());

        List<Card> subCards = client.cardContentRestEndpoint.getSubCards(rootCardContentId);
        Assertions.assertNotNull(subCards);
        Assertions.assertEquals(1, subCards.size());
        Assertions.assertEquals(cardId, subCards.get(0).getId());

        client.cardRestEndpoint.deleteCard(cardId);

        subCards = client.cardContentRestEndpoint.getSubCards(rootCardContentId);
        Assertions.assertNotNull(subCards);
        Assertions.assertEquals(0, subCards.size());
    }

    @Test
    public void testCardTypeAccess() {
        Project project = ColabFactory.createProject(client, "testCardTypeAccess");
        Long projectId = project.getId();

        CardType cardType = ColabFactory.createCardType(client, projectId);
        Long cardTypeId = cardType.getId();

        Long parentId = ColabFactory.getRootContent(client, project).getId();

        Card card = ColabFactory.createNewCard(client, parentId, cardTypeId);

        Assertions.assertEquals(cardTypeId, card.getCardTypeId());

        client.cardRestEndpoint.deleteCard(card.getId());
    }

    @Test
    public void testProjectRootCardAccess() {
        Project project = ColabFactory.createProject(client, "testProjectRootCardAccess");
        Long projectId = project.getId();

        Card rootCard = client.projectRestEndpoint.getRootCardOfProject(projectId);
        Long rootCardId = rootCard.getId();

        Assertions.assertEquals(projectId, rootCard.getRootCardProjectId());

        try {
            client.cardRestEndpoint.deleteCard(rootCardId);
        } catch (HttpErrorMessage hem) {
            // expected way
            Assertions.assertEquals(HttpErrorMessage.MessageCode.DATA_INTEGRITY_FAILURE,
                hem.getMessageCode());
            return;
        }

        Assertions.fail();
    }

}
