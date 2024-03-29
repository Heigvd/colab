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
import ch.colabproject.colab.api.model.common.DeletionStatus;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
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
        Assertions.assertNull(cardContent.getStatus());

        List<Card> subCards = client.cardContentRestEndpoint.getSubCards(cardContentId);
        Assertions.assertNotNull(subCards);
        Assertions.assertEquals(0, subCards.size());
    }

    @Test
    public void testUpdateCardContent() {
        DeletionStatus ds = DeletionStatus.BIN;
        String title = "Galaxy plan " + ((int) (Math.random() * 1000));
        int completionLevel = (int) (Math.random() * 100);

        Project project = ColabFactory.createProject(client, "testUpdateCardContent");
        Long cardId = ColabFactory.createNewCard(client, project).getId();

        CardContent cardContent = client.cardContentRestEndpoint.createNewCardContent(cardId);
        Long cardContentId = cardContent.getId();

        Assertions.assertNull(cardContent.getDeletionStatus());
        Assertions.assertNull(cardContent.getTitle());
        Assertions.assertEquals(0, cardContent.getCompletionLevel());
        Assertions.assertNull(cardContent.getCompletionMode());
        Assertions.assertNull(cardContent.getStatus());

        cardContent.setDeletionStatus(ds);
        cardContent.setTitle(title);
        cardContent.setCompletionLevel(completionLevel);
        cardContent.setStatus(CardContentStatus.ACTIVE);
        cardContent.setCompletionMode(CardContentCompletionMode.NO_OP);
        client.cardContentRestEndpoint.updateCardContent(cardContent);

        CardContent persistedCardContent = client.cardContentRestEndpoint
                .getCardContent(cardContentId);
        Assertions.assertEquals(ds, persistedCardContent.getDeletionStatus());
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

}
