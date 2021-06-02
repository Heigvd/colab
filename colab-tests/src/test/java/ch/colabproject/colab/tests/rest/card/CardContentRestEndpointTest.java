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
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.document.BlockDocument;
import ch.colabproject.colab.api.model.document.Document;
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
public class CardContentRestEndpointTest extends AbstractArquillianTest {

    @Test
    public void testCreateCardContent() {
        Long projectId = client.projectRestEndpoint.createProject(new Project());
        Project project = client.projectRestEndpoint.getProject(projectId);

        Card card = client.cardRestEndpoint.getCard(project.getRootCardId());
        Long cardId = card.getId();

        CardContent cardContent = client.cardContentRestEndpoint.createNewCardContent(cardId);
        Long cardContentId = cardContent.getId();

        Assertions.assertNotNull(cardContent);
        Assertions.assertNotNull(cardContent.getId());
        Assertions.assertEquals(cardId, cardContent.getCardId());
        Assertions.assertNull(cardContent.getTitle());
        Assertions.assertEquals(0, cardContent.getCompletionLevel());
        Assertions.assertNull(cardContent.getCompletionMode());
        Assertions.assertEquals(CardContentStatus.ACTIVE, cardContent.getStatus());

        List<Card> subCards = client.cardContentRestEndpoint.getSubCards(cardContentId);
        Assertions.assertNotNull(subCards);
        Assertions.assertEquals(0, subCards.size());
    }

    @Test
    public void testUpdateCardContent() {
        String title = "Galaxy plan " + ((int) (Math.random() * 1000));
        int completionLevel = (int) (Math.random() * 100);

        Long projectId = client.projectRestEndpoint.createProject(new Project());
        Project project = client.projectRestEndpoint.getProject(projectId);

        Card card = client.cardRestEndpoint.getCard(project.getRootCardId());
        Long cardId = card.getId();

        CardContent cardContent = client.cardContentRestEndpoint.createNewCardContent(cardId);
        Long cardContentId = cardContent.getId();

        Assertions.assertNull(cardContent.getTitle());
        Assertions.assertEquals(0, cardContent.getCompletionLevel());
        Assertions.assertNull(cardContent.getCompletionMode());
        Assertions.assertEquals(CardContentStatus.ACTIVE, cardContent.getStatus());

        cardContent.setTitle(title);
        cardContent.setCompletionLevel(completionLevel);
        cardContent.setStatus(CardContentStatus.ACTIVE);
        cardContent.setCompletionMode(CardContentCompletionMode.NO_OP);
        client.cardContentRestEndpoint.updateCardContent(cardContent);

        CardContent persistedCardContent = client.cardContentRestEndpoint
            .getCardContent(cardContentId);
        Assertions.assertEquals(title, persistedCardContent.getTitle());
        Assertions.assertEquals(completionLevel, persistedCardContent.getCompletionLevel());
        Assertions.assertEquals(CardContentCompletionMode.NO_OP,
            persistedCardContent.getCompletionMode());
        Assertions.assertEquals(CardContentStatus.ACTIVE, persistedCardContent.getStatus());
    }

    @Test
    public void testGetAllCardContents() {

        Long projectId = client.projectRestEndpoint.createProject(new Project());
        Project project = client.projectRestEndpoint.getProject(projectId);

        Card card = client.cardRestEndpoint.getCard(project.getRootCardId());
        Long cardId = card.getId();

        int initialSize = client.cardContentRestEndpoint.getAllCardContents().size();

        CardContent cardContent = client.cardContentRestEndpoint.createNewCardContent(cardId);
        cardContent.setTitle("Sketch");
        client.cardContentRestEndpoint.updateCardContent(cardContent);

        cardContent = client.cardContentRestEndpoint.createNewCardContent(cardId);
        cardContent.setTitle("Artistic best practices");
        client.cardContentRestEndpoint.updateCardContent(cardContent);

        List<CardContent> cardContents = client.cardContentRestEndpoint.getAllCardContents();
        Assertions.assertEquals(initialSize + 2, cardContents.size());
    }

    @Test
    public void testDeleteCardContent() {
        Long projectId = client.projectRestEndpoint.createProject(new Project());
        Project project = client.projectRestEndpoint.getProject(projectId);

        Card card = client.cardRestEndpoint.getCard(project.getRootCardId());
        Long cardId = card.getId();

        CardContent cardContent = client.cardContentRestEndpoint.createNewCardContent(cardId);
        Long cardContentId = cardContent.getId();

        CardContent persistedCardContent = client.cardContentRestEndpoint
            .getCardContent(cardContentId);
        Assertions.assertNotNull(persistedCardContent);

        client.cardContentRestEndpoint.deleteCardContent(cardContentId);

        persistedCardContent = client.cardContentRestEndpoint.getCardContent(cardContentId);
        Assertions.assertNull(persistedCardContent);
    }

    @Test
    public void testVariantAccess() {
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

        CardContent cardContent = client.cardContentRestEndpoint.createNewCardContent(cardId);
        Long cardContentId = cardContent.getId();

        Assertions.assertEquals(cardId, cardContent.getCardId());

        List<CardContent> variants = client.cardRestEndpoint.getContentVariantsOfCard(cardId);
        Assertions.assertNotNull(variants);
        Assertions.assertEquals(2, variants.size());
        Assertions.assertTrue(cardContentId.equals(variants.get(0).getId())
            || cardContentId.equals(variants.get(1).getId()));
    }

    @Test
    public void testDeliverableAccess() {
        String title = "Description of what we need #" + ((int) (Math.random() * 1000));

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

        CardContent cardContent = client.cardRestEndpoint.getContentVariantsOfCard(cardId).get(0);
        Long cardContentId = cardContent.getId();

        Document newDoc = new BlockDocument();
        newDoc.setTitle(title);

        Document persistedDoc = client.cardContentRestEndpoint.assignDeliverable(cardContentId, newDoc);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertNotNull(persistedDoc.getId());
        Long docId = persistedDoc.getId();
        Assertions.assertEquals(title, newDoc.getTitle());
        Assertions.assertEquals(cardContentId, persistedDoc.getDeliverableCardContentId());

        CardContent persistedCardContent = client.cardContentRestEndpoint.getCardContent(cardContentId);
        Assertions.assertNotNull(persistedCardContent);
        Assertions.assertEquals(docId, persistedCardContent.getDeliverableId());

        Document persistedDocument = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertEquals(persistedDoc, persistedDocument);
    }

}
