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
public class CardRestEndpointTest extends AbstractArquillianTest {

    @Test
    public void testCreateCard() {
        Long projectId = client.projectRestEndpoint.createProject(new Project());
        Project project = client.projectRestEndpoint.getProject(projectId);

        CardType cardType = this.createCardType(projectId);
        Long cardTypeId = client.cardTypeRestEndpoint.createCardType(cardType);

        Card rootCard = client.cardRestEndpoint.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardRestEndpoint
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        Card card = client.cardRestEndpoint.createNewCard(parentId, cardTypeId);
        Long cardId = card.getId();

        Assertions.assertNotNull(card);
        Assertions.assertNotNull(card.getId());
        Assertions.assertNull(card.getColor());
        Assertions.assertEquals(0, card.getIndex());
        Assertions.assertEquals(parentId, card.getParentId());
        Assertions.assertEquals(cardTypeId, card.getCardTypeId());

        List<CardContent> variants = client.cardRestEndpoint.getContentVariantsOfCard(cardId);
        Assertions.assertNotNull(variants);
        Assertions.assertEquals(1, variants.size());
        Assertions.assertEquals(cardId, variants.get(0).getCardId());
        Assertions.assertNotEquals(parentId, variants.get(0).getId());
    }

    @Test
    public void testUpdateCard() {
        Long projectId = client.projectRestEndpoint.createProject(new Project());
        Project project = client.projectRestEndpoint.getProject(projectId);

        CardType cardType = this.createCardType(projectId);
        Long cardTypeId = cardType.getId();

        Card rootCard = client.cardRestEndpoint.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardRestEndpoint
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        Card card = client.cardRestEndpoint.createNewCard(parentId, cardTypeId);
        Long cardId = card.getId();

        Assertions.assertNull(card.getColor());
        Assertions.assertEquals(0, card.getIndex());

        String color = "blue " + ((int) (Math.random() * 1000));
        int index = (int) (Math.random() * 100);

        card.setColor(color);
        card.setIndex(index);
        client.cardRestEndpoint.updateCard(card);

        Card persistedCard = client.cardRestEndpoint.getCard(cardId);
        Assertions.assertEquals(color, persistedCard.getColor());
        Assertions.assertEquals(index, persistedCard.getIndex());
    }

    @Test
    public void testGetAllCards() {
        Long projectId = client.projectRestEndpoint.createProject(new Project());
        Project project = client.projectRestEndpoint.getProject(projectId);

        CardType cardType1 = this.createCardType(projectId);
        Long cardType1Id = cardType1.getId();

        CardType cardType2 = this.createCardType(projectId);
        Long cardType2Id = cardType2.getId();

        Card rootCard = client.cardRestEndpoint.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardRestEndpoint
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        int initialSize = client.cardRestEndpoint.getAllCards().size();

        Card card1 = client.cardRestEndpoint.createNewCard(parentId, cardType1Id);
        card1.setIndex(1337);
        card1.setColor("red");
        client.cardRestEndpoint.updateCard(card1);

        Card card2 = client.cardRestEndpoint.createNewCard(parentId, cardType2Id);
        card2.setIndex(42);
        card2.setColor("yellow");
        client.cardRestEndpoint.updateCard(card2);

        List<Card> cards = client.cardRestEndpoint.getAllCards();
        Assertions.assertEquals(initialSize + 2, cards.size());
    }

    @Test
    public void testDeleteCard() {
        Long projectId = client.projectRestEndpoint.createProject(new Project());
        Project project = client.projectRestEndpoint.getProject(projectId);

        CardType cardType = this.createCardType(projectId);
        Long cardTypeId = cardType.getId();

        Card rootCard = client.cardRestEndpoint.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardRestEndpoint
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        Card card = client.cardRestEndpoint.createNewCard(parentId, cardTypeId);
        Long cardId = card.getId();

        Card persistedCard = client.cardRestEndpoint.getCard(cardId);
        Assertions.assertNotNull(persistedCard);

        client.cardRestEndpoint.deleteCard(cardId);

        persistedCard = client.cardRestEndpoint.getCard(cardId);
        Assertions.assertNull(persistedCard);
    }

    @Test
    public void testSubCardAccess() {
        Long projectId = client.projectRestEndpoint.createProject(new Project());
        Project project = client.projectRestEndpoint.getProject(projectId);

        CardType cardType = this.createCardType(projectId);
        Long cardTypeId = cardType.getId();

        Card rootCard = client.cardRestEndpoint.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardRestEndpoint
            .getContentVariantsOfCard(rootCardId);
        CardContent rootCardContent = rootCardContents.get(0);
        Long rootCardContentId = rootCardContent.getId();

        Card card = client.cardRestEndpoint.createNewCard(rootCardContentId, cardTypeId);
        Long cardId = card.getId();

        Assertions.assertEquals(rootCardContentId, card.getParentId());

        List<Card> subCards = client.cardContentRestEndpoint.getSubCards(rootCardContentId);
        Assertions.assertNotNull(subCards);
        Assertions.assertEquals(1, subCards.size());
        Assertions.assertEquals(cardId, subCards.get(0).getId());
    }

    @Test
    public void testCardTypeAccess() {
        Long projectId = client.projectRestEndpoint.createProject(new Project());
        Project project = client.projectRestEndpoint.getProject(projectId);

        CardType cardType = this.createCardType(projectId);
        Long cardTypeId = cardType.getId();

        Card rootCard = client.cardRestEndpoint.getCard(project.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardRestEndpoint
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        Card card = client.cardRestEndpoint.createNewCard(parentId, cardTypeId);

        Assertions.assertEquals(cardTypeId, card.getCardTypeId());

    }

    @Test
    public void testProjectRootCardAccess() {
        Long projectId = client.projectRestEndpoint.createProject(new Project());
        Project project = client.projectRestEndpoint.getProject(projectId);

        Card rootCard = client.cardRestEndpoint.getCard(project.getRootCardId());

        Assertions.assertEquals(projectId, rootCard.getRootCardProjectId());
    }

}
