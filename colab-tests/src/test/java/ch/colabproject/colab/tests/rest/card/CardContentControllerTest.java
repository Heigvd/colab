/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.card;

import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardContentCompletionMode;
import ch.colabproject.colab.api.model.card.CardContentStatus;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Unit testing of card content controller
 *
 * @author sandra
 */
public class CardContentControllerTest extends AbstractArquillianTest {

    @Test
    public void testCreateCardContent() {
        CardContent cardContent = new CardContent();
        cardContent.setTitle("Receipt");
        cardContent.setStatus(CardContentStatus.POSTPONED);
        cardContent.setCompletionLevel(15);
        cardContent.setCompletionMode(CardContentCompletionMode.AUTO);

        Long cardContentId = client.cardContentController.createCardContent(cardContent);
        CardContent persistedCardContent = client.cardContentController
                .getCardContent(cardContentId);

        Assertions.assertNotNull(persistedCardContent);
        Assertions.assertNotNull(persistedCardContent.getId());

        Assertions.assertEquals(persistedCardContent.getId(), cardContentId);
        Assertions.assertEquals("Receipt", persistedCardContent.getTitle());
        Assertions.assertEquals(15, persistedCardContent.getCompletionLevel());
        Assertions.assertEquals(CardContentCompletionMode.AUTO, persistedCardContent.getCompletionMode());
        Assertions.assertEquals(CardContentStatus.POSTPONED, persistedCardContent.getStatus());
    }

    @Test
    public void testUpdateCardContent() {
        CardContent cardContent = new CardContent();
        Long cardContentId = client.cardContentController.createCardContent(cardContent);

        cardContent = client.cardContentController.getCardContent(cardContentId);
        cardContent.setTitle("Galaxy plan");
        cardContent.setCompletionLevel(23);
        cardContent.setStatus(CardContentStatus.ACTIVE);
        cardContent.setCompletionMode(CardContentCompletionMode.NO_OP);
        client.cardContentController.updateCardContent(cardContent);

        CardContent cardContent2 = client.cardContentController.getCardContent(cardContentId);
        Assertions.assertEquals("Galaxy plan", cardContent2.getTitle());
    }

    @Test
    public void testGetAllCardContents() {
        CardContent cardContent = new CardContent();
        cardContent.setTitle("Sketch");
        client.cardContentController.createCardContent(cardContent);

        cardContent = new CardContent();
        cardContent.setTitle("Artistic best practices");
        client.cardContentController.createCardContent(cardContent);

        List<CardContent> cardContents = client.cardContentController.getAllCardContents();
        Assertions.assertEquals(2, cardContents.size());
    }

    @Test
    public void testDeleteCardContent() {
        CardContent cardContent = new CardContent();
        Long cardContentId = client.cardContentController.createCardContent(cardContent);

        CardContent persistedCardContent = client.cardContentController
                .getCardContent(cardContentId);
        Assertions.assertNotNull(persistedCardContent);

        client.cardContentController.deleteCardContent(cardContentId);

        persistedCardContent = client.cardContentController.getCardContent(cardContentId);
        Assertions.assertNull(persistedCardContent);
    }
}
