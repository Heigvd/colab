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
public class CardContentEndpointTest extends AbstractArquillianTest {

    @Test
    public void testCreateCardContent() {
        Long projectId = client.projectEndpoint.createProject(new Project());
        Project project = client.projectEndpoint.getProject(projectId);

        Card card = client.cardEndpoint.getCard(project.getRootCardId());
        Long cardId = card.getId();

        CardContent cardContent = client.cardContentEndpoint.createNewCardContent(cardId);
        Long cardContentId = cardContent.getId();

        Assertions.assertNotNull(cardContent);
        Assertions.assertNotNull(cardContent.getId());
        Assertions.assertEquals(cardId, cardContent.getCardId());
        Assertions.assertNull(cardContent.getTitle());
        Assertions.assertEquals(0, cardContent.getCompletionLevel());
        Assertions.assertNull(cardContent.getCompletionMode());
        Assertions.assertEquals(CardContentStatus.ACTIVE, cardContent.getStatus());

        List<Card> subCards = client.cardContentEndpoint.getSubCards(cardContentId);
        Assertions.assertNotNull(subCards);
        Assertions.assertEquals(0, subCards.size());
    }

    @Test
    public void testUpdateCardContent() {
        String title = "Galaxy plan " + ((int) (Math.random() * 1000));
        int completionLevel = (int) (Math.random() * 100);

        Long projectId = client.projectEndpoint.createProject(new Project());
        Project project = client.projectEndpoint.getProject(projectId);

        Card card = client.cardEndpoint.getCard(project.getRootCardId());
        Long cardId = card.getId();

        CardContent cardContent = client.cardContentEndpoint.createNewCardContent(cardId);
        Long cardContentId = cardContent.getId();

        Assertions.assertNull(cardContent.getTitle());
        Assertions.assertEquals(0, cardContent.getCompletionLevel());
        Assertions.assertNull(cardContent.getCompletionMode());
        Assertions.assertEquals(CardContentStatus.ACTIVE, cardContent.getStatus());

        cardContent.setTitle(title);
        cardContent.setCompletionLevel(completionLevel);
        cardContent.setStatus(CardContentStatus.ACTIVE);
        cardContent.setCompletionMode(CardContentCompletionMode.NO_OP);
        client.cardContentEndpoint.updateCardContent(cardContent);

        CardContent persistedCardContent = client.cardContentEndpoint
            .getCardContent(cardContentId);
        Assertions.assertEquals(title, persistedCardContent.getTitle());
        Assertions.assertEquals(completionLevel, persistedCardContent.getCompletionLevel());
        Assertions.assertEquals(CardContentCompletionMode.NO_OP,
            persistedCardContent.getCompletionMode());
        Assertions.assertEquals(CardContentStatus.ACTIVE, persistedCardContent.getStatus());
    }

    @Test
    public void testGetAllCardContents() {

        Long projectId = client.projectEndpoint.createProject(new Project());
        Project project = client.projectEndpoint.getProject(projectId);

        Card card = client.cardEndpoint.getCard(project.getRootCardId());
        Long cardId = card.getId();

        int initialSize = client.cardContentEndpoint.getAllCardContents().size();

        CardContent cardContent = client.cardContentEndpoint.createNewCardContent(cardId);
        cardContent.setTitle("Sketch");
        client.cardContentEndpoint.updateCardContent(cardContent);

        cardContent = client.cardContentEndpoint.createNewCardContent(cardId);
        cardContent.setTitle("Artistic best practices");
        client.cardContentEndpoint.updateCardContent(cardContent);

        List<CardContent> cardContents = client.cardContentEndpoint.getAllCardContents();
        Assertions.assertEquals(initialSize + 2, cardContents.size());
    }

    @Test
    public void testDeleteCardContent() {
        Long projectId = client.projectEndpoint.createProject(new Project());
        Project project = client.projectEndpoint.getProject(projectId);

        Card card = client.cardEndpoint.getCard(project.getRootCardId());
        Long cardId = card.getId();

        CardContent cardContent = client.cardContentEndpoint.createNewCardContent(cardId);
        Long cardContentId = cardContent.getId();

        CardContent persistedCardContent = client.cardContentEndpoint
            .getCardContent(cardContentId);
        Assertions.assertNotNull(persistedCardContent);

        client.cardContentEndpoint.deleteCardContent(cardContentId);

        persistedCardContent = client.cardContentEndpoint.getCardContent(cardContentId);
        Assertions.assertNull(persistedCardContent);
    }

    @Test
    public void testVariantAccess() {
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
    public void testDeliverableAccess() {
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

        CardContent cardContent = client.cardEndpoint.getContentVariantsOfCard(cardId).get(0);
        Long cardContentId = cardContent.getId();

        Long docId = client.documentRestEndPoint.createDocument(new BlockDocument());

        cardContent.setDeliverableId(docId);
        client.cardContentEndpoint.updateCardContent(cardContent);

        CardContent persistedCardContent = client.cardContentEndpoint.getCardContent(cardContentId);
        Assertions.assertNotNull(persistedCardContent);
        Assertions.assertEquals(docId, persistedCardContent.getDeliverableId());

        Document persistedDocument = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(persistedDocument);
        Assertions.assertEquals(cardContentId, persistedDocument.getDeliverableCardContentId());
    }

}
