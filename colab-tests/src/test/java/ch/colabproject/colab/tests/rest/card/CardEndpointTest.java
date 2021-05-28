/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.card;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Unit testing of card controller from a client point of view
 *
 * @author sandra
 */
public class CardEndpointTest extends AbstractArquillianTest {

    @Test
    public void testCreateCard() {
        Long projectId = client.projectEndpoint.createProject(new Project());
        Project project = client.projectEndpoint.getProject(projectId);

        CardType cardType = this.createCardType(projectId);
        Long cardTypeId = client.cardTypeEndpoint.createCardType(cardType);

        Card rootCard = client.cardEndpoint.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardEndpoint
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        Card card = client.cardEndpoint.createNewCard(parentId, cardTypeId);
        Long cardId = card.getId();

        Assertions.assertNotNull(card);
        Assertions.assertNotNull(card.getId());
        Assertions.assertNull(card.getColor());
        Assertions.assertEquals(0, card.getIndex());
        Assertions.assertEquals(parentId, card.getParentId());
        Assertions.assertEquals(cardTypeId, card.getCardTypeinitionId());

        List<CardContent> variants = client.cardEndpoint.getContentVariantsOfCard(cardId);
        Assertions.assertNotNull(variants);
        Assertions.assertEquals(1, variants.size());
        Assertions.assertEquals(cardId, variants.get(0).getCardId());
        Assertions.assertNotEquals(parentId, variants.get(0).getId());
    }

    @Test
    public void testUpdateCard() {
        Long projectId = client.projectEndpoint.createProject(new Project());
        Project project = client.projectEndpoint.getProject(projectId);

        CardType cardType = this.createCardType(projectId);
        Long cardTypeId = cardType.getId();

        Card rootCard = client.cardEndpoint.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardEndpoint
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        Card card = client.cardEndpoint.createNewCard(parentId, cardTypeId);
        Long cardId = card.getId();

        Assertions.assertNull(card.getColor());
        Assertions.assertEquals(0, card.getIndex());

        String color = "blue " + ((int) (Math.random() * 1000));
        int index = (int) (Math.random() * 100);

        card.setColor(color);
        card.setIndex(index);
        client.cardEndpoint.updateCard(card);

        Card persistedCard = client.cardEndpoint.getCard(cardId);
        Assertions.assertEquals(color, persistedCard.getColor());
        Assertions.assertEquals(index, persistedCard.getIndex());
    }

    @Test
    public void testGetAllCards() {
        Long projectId = client.projectEndpoint.createProject(new Project());
        Project project = client.projectEndpoint.getProject(projectId);

        CardType cardType1 = this.createCardType(projectId);
        Long cardType1Id = cardType1.getId();

        CardType cardType2 = this.createCardType(projectId);
        Long cardType2Id = cardType2.getId();

        Card rootCard = client.cardEndpoint.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardEndpoint
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        int initialSize = client.cardEndpoint.getAllCards().size();

        Card card1 = client.cardEndpoint.createNewCard(parentId, cardType1Id);
        card1.setIndex(1337);
        card1.setColor("red");
        client.cardEndpoint.updateCard(card1);

        Card card2 = client.cardEndpoint.createNewCard(parentId, cardType2Id);
        card2.setIndex(42);
        card2.setColor("yellow");
        client.cardEndpoint.updateCard(card2);

        List<Card> cards = client.cardEndpoint.getAllCards();
        Assertions.assertEquals(initialSize + 2, cards.size());
    }

    @Test
    public void testDeleteCard() {
        Long projectId = client.projectEndpoint.createProject(new Project());
        Project project = client.projectEndpoint.getProject(projectId);

        CardType cardType = this.createCardType(projectId);
        Long cardTypeId = cardType.getId();

        Card rootCard = client.cardEndpoint.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardEndpoint
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        Card card = client.cardEndpoint.createNewCard(parentId, cardTypeId);
        Long cardId = card.getId();

        Card persistedCard = client.cardEndpoint.getCard(cardId);
        Assertions.assertNotNull(persistedCard);

        client.cardEndpoint.deleteCard(cardId);

        persistedCard = client.cardEndpoint.getCard(cardId);
        Assertions.assertNull(persistedCard);
    }

    @Test
    public void testCardContentAccess() {
        Long projectId = client.projectEndpoint.createProject(new Project());
        Project project = client.projectEndpoint.getProject(projectId);

        CardType cardType = this.createCardType(projectId);
        Long cardTypeId = cardType.getId();

        Card rootCard = client.cardEndpoint.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardEndpoint
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        Card card = client.cardEndpoint.createNewCard(parentId, cardTypeId);
        Long cardId = card.getId();

        CardContent cardContent = client.cardContentEndpoint.createNewCardContent(cardId);
        Long cardContentId = cardContent.getId();

        Assertions.assertEquals(cardId, cardContent.getCardId());

        List<CardContent> variants = client.cardEndpoint.getContentVariantsOfCard(cardId);
        Assertions.assertNotNull(variants);
        Assertions.assertEquals(2, variants.size());
        Assertions.assertTrue(cardContentId.equals(variants.get(0).getId())
            || cardContentId.equals(variants.get(1).getId()));
    }

    @Test
    public void SubCardAccess() {
        Long projectId = client.projectEndpoint.createProject(new Project());
        Project project = client.projectEndpoint.getProject(projectId);

        CardType cardType = this.createCardType(projectId);
        Long cardTypeId = cardType.getId();

        Card rootCard = client.cardEndpoint.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardEndpoint
            .getContentVariantsOfCard(rootCardId);
        CardContent rootCardContent = rootCardContents.get(0);
        Long rootCardContentId = rootCardContent.getId();

        Card card = client.cardEndpoint.createNewCard(rootCardContentId, cardTypeId);
        Long cardId = card.getId();

        Assertions.assertEquals(rootCardContentId, card.getParentId());

        List<Card> subCards = client.cardContentEndpoint.getSubCards(rootCardContentId);
        Assertions.assertNotNull(subCards);
        Assertions.assertEquals(1, subCards.size());
        Assertions.assertEquals(cardId, subCards.get(0).getId());
    }

    @Test
    public void testCardTypeAccess() {
        Long projectId = client.projectEndpoint.createProject(new Project());
        Project project = client.projectEndpoint.getProject(projectId);

        CardType cardType = this.createCardType(projectId);
        Long cardTypeId = cardType.getId();

        Card rootCard = client.cardEndpoint.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardEndpoint
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        Card card = client.cardEndpoint.createNewCard(parentId, cardTypeId);

        Assertions.assertEquals(cardTypeId, card.getCardTypeinitionId());
    }
}
