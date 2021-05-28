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
public class CardControllerTest extends AbstractArquillianTest {

    @Test
    public void testCreateCard() {
        Long projectId = client.projectController.createProject(new Project());
        Project project = client.projectController.getProject(projectId);

        CardDef cardDef = this.createCardDef(projectId);
        Long cardDefId = client.cardDefController.createCardDef(cardDef);

        Card rootCard = client.cardController.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardController
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        Card card = client.cardController.createNewCard(parentId, cardDefId);
        Long cardId = card.getId();

        Assertions.assertNotNull(card);
        Assertions.assertNotNull(card.getId());
        Assertions.assertNull(card.getColor());
        Assertions.assertEquals(0, card.getIndex());
        Assertions.assertEquals(parentId, card.getParentId());
        Assertions.assertEquals(cardDefId, card.getCardDefinitionId());

        List<CardContent> variants = client.cardController.getContentVariantsOfCard(cardId);
        Assertions.assertNotNull(variants);
        Assertions.assertEquals(1, variants.size());
        Assertions.assertEquals(cardId, variants.get(0).getCardId());
        Assertions.assertNotEquals(parentId, variants.get(0).getId());
    }

    @Test
    public void testUpdateCard() {
        Long projectId = client.projectController.createProject(new Project());
        Project project = client.projectController.getProject(projectId);

        CardDef cardDef = this.createCardDef(projectId);
        Long cardDefId = cardDef.getId();

        Card rootCard = client.cardController.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardController
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        Card card = client.cardController.createNewCard(parentId, cardDefId);
        Long cardId = card.getId();

        Assertions.assertNull(card.getColor());
        Assertions.assertEquals(0, card.getIndex());

        String color = "blue " + ((int) (Math.random() * 1000));
        int index = (int) (Math.random() * 100);

        card.setColor(color);
        card.setIndex(index);
        client.cardController.updateCard(card);

        Card persistedCard = client.cardController.getCard(cardId);
        Assertions.assertEquals(color, persistedCard.getColor());
        Assertions.assertEquals(index, persistedCard.getIndex());
    }

    @Test
    public void testGetAllCards() {
        Long projectId = client.projectController.createProject(new Project());
        Project project = client.projectController.getProject(projectId);

        CardDef cardDef1 = this.createCardDef(projectId);
        Long cardDef1Id = cardDef1.getId();

        CardDef cardDef2 = this.createCardDef(projectId);
        Long cardDef2Id = cardDef2.getId();

        Card rootCard = client.cardController.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardController
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        int initialSize = client.cardController.getAllCards().size();

        Card card1 = client.cardController.createNewCard(parentId, cardDef1Id);
        card1.setIndex(1337);
        card1.setColor("red");
        client.cardController.updateCard(card1);

        Card card2 = client.cardController.createNewCard(parentId, cardDef2Id);
        card2.setIndex(42);
        card2.setColor("yellow");
        client.cardController.updateCard(card2);

        List<Card> cards = client.cardController.getAllCards();
        Assertions.assertEquals(initialSize + 2, cards.size());
    }

    @Test
    public void testDeleteCard() {
        Long projectId = client.projectController.createProject(new Project());
        Project project = client.projectController.getProject(projectId);

        CardDef cardDef = this.createCardDef(projectId);
        Long cardDefId = cardDef.getId();

        Card rootCard = client.cardController.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardController
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        Card card = client.cardController.createNewCard(parentId, cardDefId);
        Long cardId = card.getId();

        Card persistedCard = client.cardController.getCard(cardId);
        Assertions.assertNotNull(persistedCard);

        client.cardController.deleteCard(cardId);

        persistedCard = client.cardController.getCard(cardId);
        Assertions.assertNull(persistedCard);
    }

    @Test
    public void testCardContentAccess() {
        Long projectId = client.projectController.createProject(new Project());
        Project project = client.projectController.getProject(projectId);

        CardDef cardDef = this.createCardDef(projectId);
        Long cardDefId = cardDef.getId();

        Card rootCard = client.cardController.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardController
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        Card card = client.cardController.createNewCard(parentId, cardDefId);
        Long cardId = card.getId();

        CardContent cardContent = client.cardContentController.createNewCardContent(cardId);
        Long cardContentId = cardContent.getId();

        Assertions.assertEquals(cardId, cardContent.getCardId());

        List<CardContent> variants = client.cardController.getContentVariantsOfCard(cardId);
        Assertions.assertNotNull(variants);
        Assertions.assertEquals(2, variants.size());
        Assertions.assertTrue(cardContentId.equals(variants.get(0).getId())
            || cardContentId.equals(variants.get(1).getId()));
    }

    @Test
    public void SubCardAccess() {
        Long projectId = client.projectController.createProject(new Project());
        Project project = client.projectController.getProject(projectId);

        CardDef cardDef = this.createCardDef(projectId);
        Long cardDefId = cardDef.getId();

        Card rootCard = client.cardController.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardController
            .getContentVariantsOfCard(rootCardId);
        CardContent rootCardContent = rootCardContents.get(0);
        Long rootCardContentId = rootCardContent.getId();

        Card card = client.cardController.createNewCard(rootCardContentId, cardDefId);
        Long cardId = card.getId();

        Assertions.assertEquals(rootCardContentId, card.getParentId());

        List<Card> subCards = client.cardContentController.getSubCards(rootCardContentId);
        Assertions.assertNotNull(subCards);
        Assertions.assertEquals(1, subCards.size());
        Assertions.assertEquals(cardId, subCards.get(0).getId());
    }

    @Test
    public void testCardDefAccess() {
        Long projectId = client.projectController.createProject(new Project());
        Project project = client.projectController.getProject(projectId);

        CardDef cardDef = this.createCardDef(projectId);
        Long cardDefId = cardDef.getId();

        Card rootCard = client.cardController.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardController
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        Card card = client.cardController.createNewCard(parentId, cardDefId);

        Assertions.assertEquals(cardDefId, card.getCardDefinitionId());
    }
}
