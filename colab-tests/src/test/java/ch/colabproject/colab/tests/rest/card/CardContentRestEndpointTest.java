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
import ch.colabproject.colab.api.model.document.BlockDocument;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of card content controller from a client point of view
 *
 * @author sandra
 */
// TODO sandra - Check the constraints
public class CardContentRestEndpointTest extends AbstractArquillianTest {

    @Test
    public void testCreateCardContent() {
        Project project = ColabFactory.createProject(client, "testCreateCardContent");
        Long cardId = ColabFactory.createNewCard(client, project).getId();

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

        Project project = ColabFactory.createProject(client, "testUpdateCardContent");
        Long cardId = ColabFactory.createNewCard(client, project).getId();

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
        Project project = ColabFactory.createProject(client, "testGetAllCardContents");
        Long cardId = ColabFactory.createNewCard(client, project).getId();

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
        Project project = ColabFactory.createProject(client, "testDeleteCardContent");
        Long cardId = ColabFactory.createNewCard(client, project).getId();

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
        Project project = ColabFactory.createProject(client, "testVariantAccess");
        Long cardId = ColabFactory.createNewCard(client, project).getId();

        CardContent cardContent = client.cardContentRestEndpoint.createNewCardContent(cardId);
        Long cardContentId = cardContent.getId();

        Assertions.assertEquals(cardId, cardContent.getCardId());

        List<CardContent> variants = client.cardRestEndpoint.getContentVariantsOfCard(cardId);
        Assertions.assertNotNull(variants);
        Assertions.assertEquals(2, variants.size());
        Assertions.assertTrue(cardContentId.equals(variants.get(0).getId())
            || cardContentId.equals(variants.get(1).getId()));

        client.cardContentRestEndpoint.deleteCardContent(cardContentId);

        variants = client.cardRestEndpoint.getContentVariantsOfCard(cardId);
        Assertions.assertNotNull(variants);
        Assertions.assertEquals(1, variants.size());
        Assertions.assertFalse(cardContentId.equals(variants.get(0).getId()));
    }

    @Test
    public void testDeliverableAccess() {
        String title = "Description of what we need #" + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client, "testDeliverableAccess");
        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long cardContentId = client.cardRestEndpoint.getContentVariantsOfCard(cardId).get(0).getId();

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

        // delete document

        client.documentRestEndPoint.deleteDocument(persistedDocument.getId());

        persistedCardContent = client.cardContentRestEndpoint.getCardContent(cardContentId);
        Assertions.assertNotNull(persistedCardContent);
        Assertions.assertNull(persistedCardContent.getDeliverableId());

        // delete card content

        newDoc = new BlockDocument();
        newDoc.setTitle(title);

        persistedDoc = client.cardContentRestEndpoint.assignDeliverable(cardContentId, newDoc);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertNotNull(persistedDoc.getId());
        Long doc2Id = persistedDoc.getId();

        persistedCardContent = client.cardContentRestEndpoint.getCardContent(cardContentId);
        Assertions.assertNotNull(persistedCardContent);
        Assertions.assertEquals(doc2Id, persistedCardContent.getDeliverableId());

        client.cardContentRestEndpoint.deleteCardContent(cardContentId);

        persistedDocument = client.documentRestEndPoint.getDocument(persistedDoc.getId());
        Assertions.assertNull(persistedDocument);
    }

}
