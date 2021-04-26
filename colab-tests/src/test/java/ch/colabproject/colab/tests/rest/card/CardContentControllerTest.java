/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.card;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardContentCompletionMode;
import ch.colabproject.colab.api.model.card.CardContentStatus;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Unit testing of card content controller from a client point of view
 *
 * @author sandra
 */
// TODO sandra - Check the constraints
public class CardContentControllerTest extends AbstractArquillianTest {

    @Test
    public void testCreateCardContent() {
        Long projectId = client.projectController.createProject(new Project());
        Project project = client.projectController.getProject(projectId);

        Card card = client.cardController.getCard(project.getRootCardId());
        Long cardId = card.getId();

        CardContent cardContent = client.cardContentController.createNewCardContent(cardId);
        Long cardContentId = cardContent.getId();

        Assertions.assertNotNull(cardContent);
        Assertions.assertNotNull(cardContent.getId());
        Assertions.assertEquals(cardId, cardContent.getCardId());
        Assertions.assertNull(cardContent.getTitle());
        Assertions.assertEquals(0, cardContent.getCompletionLevel());
        Assertions.assertNull(cardContent.getCompletionMode());
        Assertions.assertEquals(CardContentStatus.ACTIVE, cardContent.getStatus());

        List<Card> subCards = client.cardContentController.getSubCards(cardContentId);
        Assertions.assertNotNull(subCards);
        Assertions.assertEquals(0, subCards.size());
    }

    @Test
    public void testUpdateCardContent() {
        String title = "Galaxy plan " + ((int) (Math.random() * 1000));
        int completionLevel = (int) (Math.random() * 100);

        Long projectId = client.projectController.createProject(new Project());
        Project project = client.projectController.getProject(projectId);

        Card card = client.cardController.getCard(project.getRootCardId());
        Long cardId = card.getId();

        CardContent cardContent = client.cardContentController.createNewCardContent(cardId);
        Long cardContentId = cardContent.getId();

        Assertions.assertNull(cardContent.getTitle());
        Assertions.assertEquals(0, cardContent.getCompletionLevel());
        Assertions.assertNull(cardContent.getCompletionMode());
        Assertions.assertEquals(CardContentStatus.ACTIVE, cardContent.getStatus());

        cardContent.setTitle(title);
        cardContent.setCompletionLevel(completionLevel);
        cardContent.setStatus(CardContentStatus.ACTIVE);
        cardContent.setCompletionMode(CardContentCompletionMode.NO_OP);
        client.cardContentController.updateCardContent(cardContent);

        CardContent persistedCardContent = client.cardContentController
                .getCardContent(cardContentId);
        Assertions.assertEquals(title, persistedCardContent.getTitle());
        Assertions.assertEquals(completionLevel, persistedCardContent.getCompletionLevel());
        Assertions.assertEquals(CardContentCompletionMode.NO_OP,
                persistedCardContent.getCompletionMode());
        Assertions.assertEquals(CardContentStatus.ACTIVE, persistedCardContent.getStatus());
    }

    @Test
    public void testGetAllCardContents() {

        Long projectId = client.projectController.createProject(new Project());
        Project project = client.projectController.getProject(projectId);

        Card card = client.cardController.getCard(project.getRootCardId());
        Long cardId = card.getId();

        int initialSize = client.cardContentController.getAllCardContents().size();

        CardContent cardContent = client.cardContentController.createNewCardContent(cardId);
        cardContent.setTitle("Sketch");
        client.cardContentController.updateCardContent(cardContent);

        cardContent = client.cardContentController.createNewCardContent(cardId);
        cardContent.setTitle("Artistic best practices");
        client.cardContentController.updateCardContent(cardContent);

        List<CardContent> cardContents = client.cardContentController.getAllCardContents();
        Assertions.assertEquals(initialSize + 2, cardContents.size());
    }

    @Test
    public void testDeleteCardContent() {
        Long projectId = client.projectController.createProject(new Project());
        Project project = client.projectController.getProject(projectId);

        Card card = client.cardController.getCard(project.getRootCardId());
        Long cardId = card.getId();

        CardContent cardContent = client.cardContentController.createNewCardContent(cardId);
        Long cardContentId = cardContent.getId();

        CardContent persistedCardContent = client.cardContentController
                .getCardContent(cardContentId);
        Assertions.assertNotNull(persistedCardContent);

        client.cardContentController.deleteCardContent(cardContentId);

        persistedCardContent = client.cardContentController.getCardContent(cardContentId);
        Assertions.assertNull(persistedCardContent);
    }
}
