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
 * Unit testing of card content controller from a client point of view
 *
 * @author sandra
 */
// TODO sandra - Check the constraints
public class CardContentControllerTest extends AbstractArquillianTest {

    @Test
    public void testCreateCardContent() {
        String title = "Receipt " + ((int) (Math.random() * 1000));
        int completionLevel = (int) (Math.random() * 100);

        CardContent cardContent = new CardContent();
        cardContent.setTitle(title);
        cardContent.setStatus(CardContentStatus.POSTPONED);
        cardContent.setCompletionLevel(completionLevel);
        cardContent.setCompletionMode(CardContentCompletionMode.AUTO);
        Long cardContentId = client.cardContentController.createCardContent(cardContent);

        CardContent persistedCardContent = client.cardContentController
                .getCardContent(cardContentId);

        Assertions.assertNotNull(persistedCardContent);
        Assertions.assertNotNull(persistedCardContent.getId());

        Assertions.assertEquals(persistedCardContent.getId(), cardContentId);
        Assertions.assertEquals(title, persistedCardContent.getTitle());
        Assertions.assertEquals(completionLevel, persistedCardContent.getCompletionLevel());
        Assertions.assertEquals(CardContentCompletionMode.AUTO,
                persistedCardContent.getCompletionMode());
        Assertions.assertEquals(CardContentStatus.POSTPONED, persistedCardContent.getStatus());
    }

    @Test
    public void testUpdateCardContent() {
        String title = "Galaxy plan " + ((int) (Math.random() * 1000));
        int completionLevel = (int) (Math.random() * 100);

        CardContent cardContent = new CardContent();
        Long cardContentId = client.cardContentController.createCardContent(cardContent);

        CardContent persistedCardContent1 = client.cardContentController
                .getCardContent(cardContentId);
        Assertions.assertNull(persistedCardContent1.getTitle());
        Assertions.assertEquals(0, persistedCardContent1.getCompletionLevel());
        Assertions.assertNull(persistedCardContent1.getCompletionMode());
        Assertions.assertNull(persistedCardContent1.getStatus());

        persistedCardContent1.setTitle(title);
        persistedCardContent1.setCompletionLevel(completionLevel);
        persistedCardContent1.setStatus(CardContentStatus.ACTIVE);
        persistedCardContent1.setCompletionMode(CardContentCompletionMode.NO_OP);
        client.cardContentController.updateCardContent(persistedCardContent1);

        CardContent persistedCardContent2 = client.cardContentController
                .getCardContent(cardContentId);
        Assertions.assertEquals(title, persistedCardContent2.getTitle());
        Assertions.assertEquals(completionLevel, persistedCardContent2.getCompletionLevel());
        Assertions.assertEquals(CardContentCompletionMode.NO_OP,
                persistedCardContent2.getCompletionMode());
        Assertions.assertEquals(CardContentStatus.ACTIVE, persistedCardContent2.getStatus());
    }

    @Test
    public void testGetAllCardContents() {
        int initialSize = client.cardContentController.getAllCardContents().size();

        CardContent cardContent = new CardContent();
        cardContent.setTitle("Sketch");
        client.cardContentController.createCardContent(cardContent);

        cardContent = new CardContent();
        cardContent.setTitle("Artistic best practices");
        client.cardContentController.createCardContent(cardContent);

        List<CardContent> cardContents = client.cardContentController.getAllCardContents();
        Assertions.assertEquals(initialSize + 2, cardContents.size());
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
