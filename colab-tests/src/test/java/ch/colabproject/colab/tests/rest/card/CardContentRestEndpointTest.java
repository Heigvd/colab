/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.card;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardContentCompletionMode;
import ch.colabproject.colab.api.model.card.CardContentStatus;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.DocumentFile;
import ch.colabproject.colab.api.model.document.ExternalLink;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import java.util.List;
import java.util.Objects;
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
    public void testDeleteCardContent() {
        Project project = ColabFactory.createProject(client, "testDeleteCardContent");
        Long cardId = ColabFactory.createNewCard(client, project).getId();

        // a new card content

        Long cardContentId = client.cardContentRestEndpoint.createNewCardContent(cardId).getId();

        CardContent persistedCardContent = client.cardContentRestEndpoint
            .getCardContent(cardContentId);
        Assertions.assertNotNull(persistedCardContent);

        client.cardContentRestEndpoint.deleteCardContent(cardContentId);

        persistedCardContent = client.cardContentRestEndpoint.getCardContent(cardContentId);
        Assertions.assertNull(persistedCardContent);

        // the card content initially created with the card

        List<CardContent> variants = client.cardRestEndpoint.getContentVariantsOfCard(cardId);
        Assertions.assertEquals(1, variants.size());
        Long initialCardContentId = variants.get(0).getId();

        CardContent initialCardContent = client.cardContentRestEndpoint
            .getCardContent(initialCardContentId);
        Assertions.assertNotNull(initialCardContent);

        boolean isErrorMessageThrown = false;
        try {
            client.cardContentRestEndpoint.deleteCardContent(initialCardContentId);
        } catch (HttpErrorMessage hem) {

            if (HttpErrorMessage.MessageCode.DATA_ERROR == hem.getMessageCode()) {
                isErrorMessageThrown = true;
            }
        }

        if (!isErrorMessageThrown) {
            Assertions.fail("We should not be allowed to delete the last card content");
        }

        initialCardContent = client.cardContentRestEndpoint.getCardContent(initialCardContentId);
        Assertions.assertNotNull(initialCardContent);
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
        Project project = ColabFactory.createProject(client, "testDeliverableAccess");
        Long cardId = ColabFactory.createNewCard(client, project).getId();

        // create a card content with a deliverable

        String doc1Url = "troispetitschats";
        ExternalLink doc1 = new ExternalLink();
        doc1.setUrl(doc1Url);

        CardContent cardContent = client.cardContentRestEndpoint
            .createNewCardContentWithDeliverable(cardId, doc1);
        Long cardContentId = cardContent.getId();

        List<Document> persistedDeliverables = client.cardContentRestEndpoint
            .getDeliverablesOfCardContent(cardContentId);
        Assertions.assertNotNull(persistedDeliverables);
        Assertions.assertEquals(1, persistedDeliverables.size());
        Document deliverable = persistedDeliverables.get(0);
        Assertions.assertNotNull(deliverable);
        Assertions.assertNotNull(deliverable.getId());
        Assertions.assertEquals(1000, deliverable.getIndex());
        Assertions.assertEquals(cardContentId, deliverable.getOwningCardContentId());
        Assertions.assertNull(deliverable.getOwningResourceId());
        Assertions.assertTrue(deliverable instanceof ExternalLink);
        Assertions.assertEquals(doc1Url, ((ExternalLink) deliverable).getUrl());
        Long doc1Id = deliverable.getId();

        Document persistedDocument1 = client.documentRestEndpoint.getDocument(doc1Id);
        Assertions.assertEquals(deliverable, persistedDocument1);

        // remove document

        client.cardContentRestEndpoint.removeDeliverable(cardContentId, doc1Id);

        persistedDeliverables = client.cardContentRestEndpoint
            .getDeliverablesOfCardContent(cardContentId);
        Assertions.assertNotNull(persistedDeliverables);
        Assertions.assertEquals(0, persistedDeliverables.size());

        persistedDocument1 = client.documentRestEndpoint.getDocument(doc1Id);
        Assertions.assertNull(persistedDocument1);

        // set new deliverables
        String doc2FileName = "shabidoo";
        DocumentFile doc2 = new DocumentFile();
        doc2.setFileName(doc2FileName);

        Document deliverable2 = client.cardContentRestEndpoint.addDeliverableAtEnd(cardContentId, doc2);
        Assertions.assertNotNull(deliverable2);
        Assertions.assertNotNull(deliverable2.getId());
        Assertions.assertEquals(1000, deliverable2.getIndex());
        Assertions.assertEquals(cardContentId, deliverable2.getOwningCardContentId());
        Assertions.assertNull(deliverable2.getOwningResourceId());
        Assertions.assertTrue(deliverable2 instanceof DocumentFile);
        Assertions.assertEquals(doc2FileName, ((DocumentFile) deliverable2).getFileName());
        Long doc2Id = deliverable2.getId();

        String doc3TextData = "mush";
        TextDataBlock doc3 = new TextDataBlock();
        doc3.setTextData(doc3TextData);

        Document deliverable3 = client.cardContentRestEndpoint.addDeliverableAtEnd(cardContentId, doc3);
        Assertions.assertNotNull(deliverable3);
        Assertions.assertNotNull(deliverable3.getId());
        Assertions.assertEquals(2000, deliverable3.getIndex());
        Assertions.assertEquals(cardContentId, deliverable3.getOwningCardContentId());
        Assertions.assertNull(deliverable3.getOwningResourceId());
        Assertions.assertTrue(deliverable3 instanceof TextDataBlock);
        Assertions.assertEquals(doc3TextData, ((TextDataBlock) deliverable3).getTextData());
        Long doc3Id = deliverable3.getId();

        persistedDeliverables = client.cardContentRestEndpoint
            .getDeliverablesOfCardContent(cardContentId);
        Assertions.assertNotNull(persistedDeliverables);
        Assertions.assertEquals(2, persistedDeliverables.size());
        Assertions.assertTrue(Objects.equals(persistedDeliverables.get(0).getId(), doc2Id)
            || Objects.equals(persistedDeliverables.get(0).getId(), doc3Id));
        Assertions.assertTrue(Objects.equals(persistedDeliverables.get(1).getId(), doc2Id)
            || Objects.equals(persistedDeliverables.get(1).getId(), doc3Id));

        client.documentRestEndpoint.moveDocumentUp(doc3Id);
        deliverable3 = client.documentRestEndpoint.getDocument(doc3Id);
        Assertions.assertEquals(1000, deliverable3.getIndex());
        deliverable2 = client.documentRestEndpoint.getDocument(doc2Id);
        Assertions.assertEquals(2000, deliverable2.getIndex());

        // delete card content

        client.cardContentRestEndpoint.deleteCardContent(cardContentId);

        persistedDocument1 = client.documentRestEndpoint.getDocument(doc2Id);
        Assertions.assertNull(persistedDocument1);

        Document persistedDocument2 = client.documentRestEndpoint.getDocument(doc2Id);
        Assertions.assertNull(persistedDocument2);

        Document persistedDocument3 = client.documentRestEndpoint.getDocument(doc3Id);
        Assertions.assertNull(persistedDocument3);
    }

}
