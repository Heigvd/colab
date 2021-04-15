/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.card;

import ch.colabproject.colab.api.model.ConcretizationCategory;
import ch.colabproject.colab.api.model.card.CardDef;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import java.util.Date;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Unit testing of card def controller from a client point of view
 *
 * @author sandra
 */
public class CardDefControllerTest extends AbstractArquillianTest {

    @Test
    public void testCreateCardDef() {
        String uniqueId = String.valueOf(new Date().getTime() + ((long) (Math.random() * 1000)));
        String title = " " + ((int) (Math.random() * 1000));
        String purpose = " " + ((int) (Math.random() * 1000));
        ConcretizationCategory authorityHolder = ConcretizationCategory.PROJECT;

        CardDef cardDef = new CardDef();
        cardDef.setUniqueId(uniqueId);
        cardDef.setTitle(title);
        cardDef.setPurpose(purpose);
        cardDef.setAuthorityHolder(authorityHolder);
        Long cardDefId = client.cardDefController.createCardDef(cardDef);

        CardDef persistedCardDef = client.cardDefController.getCardDef(cardDefId);

        Assertions.assertNotNull(persistedCardDef);
        Assertions.assertNotNull(persistedCardDef.getId());

        Assertions.assertEquals(persistedCardDef.getId(), cardDefId);
        Assertions.assertEquals(persistedCardDef.getUniqueId(), uniqueId);
        Assertions.assertEquals(persistedCardDef.getTitle(), title);
        Assertions.assertEquals(persistedCardDef.getPurpose(), purpose);
        Assertions.assertEquals(persistedCardDef.getAuthorityHolder(), authorityHolder);
    }

    @Test
    public void testUpdateCardDef() {
        // String uniqueId = String.valueOf(new Date().getTime() + ((long)(Math.random()
        // * 1000)));
        String title = "Dissemination " + ((int) (Math.random() * 1000));
        String purpose = "Define how the project will be promoted "
                + ((int) (Math.random() * 1000));
        ConcretizationCategory authorityHolder = ConcretizationCategory.PROJECT;

        CardDef cardDef = new CardDef();
        Long cardDefId = client.cardDefController.createCardDef(cardDef);

        cardDef = client.cardDefController.getCardDef(cardDefId);
        Assertions.assertNull(cardDef.getUniqueId());
        Assertions.assertNull(cardDef.getTitle());
        Assertions.assertNull(cardDef.getPurpose());
        Assertions.assertNull(cardDef.getAuthorityHolder());
        Assertions.assertNull(cardDef.getProject());

        // cardDef.setUniqueId(uniqueId);
        cardDef.setTitle(title);
        cardDef.setPurpose(purpose);
        cardDef.setAuthorityHolder(authorityHolder);
        client.cardDefController.updateCardDef(cardDef);

        CardDef persistedCardDef2 = client.cardDefController.getCardDef(cardDefId);
        // Assertions.assertEquals(uniqueId, persistedCardDef2.getUniqueId());
        Assertions.assertEquals(title, persistedCardDef2.getTitle());
        Assertions.assertEquals(purpose, persistedCardDef2.getPurpose());
        // Assertions.assertEquals(authorityHolder,
        // persistedCardDef2.getAuthorityHolderType());
    }

    @Test
    public void testGetAllCardDefs() {
        int initialSize = client.cardDefController.getAllCardDefs().size();

        CardDef cardDef1 = new CardDef();
        cardDef1.setTitle("Game design");
        client.cardDefController.createCardDef(cardDef1);

        CardDef cardDef2 = new CardDef();
        cardDef2.setTitle("Game rules");
        client.cardDefController.createCardDef(cardDef2);

        List<CardDef> cardDefs = client.cardDefController.getAllCardDefs();
        Assertions.assertEquals(initialSize + 2, cardDefs.size());
    }

    @Test
    public void testDeleteCardDef() {
        CardDef cardDef = new CardDef();
        Long cardDefId = client.cardDefController.createCardDef(cardDef);

        CardDef persistedCardDef = client.cardDefController.getCardDef(cardDefId);
        Assertions.assertNotNull(persistedCardDef);

        client.cardDefController.deleteCardDef(cardDefId);

        persistedCardDef = client.cardDefController.getCardDef(cardDefId);
        Assertions.assertNull(persistedCardDef);
    }

    @Test
    public void testProjectAccess() {
        String projectName = "Easy learn german " + ((int) (Math.random() * 1000));
        String cardDefTitle = "design " + ((int) (Math.random() * 1000));

        Project project = new Project();
        project.setName(projectName);
        Long projectId = client.projectController.createProject(project);

        Project persistedProject = client.projectController.getProject(projectId);

        CardDef cardDef = new CardDef();
        cardDef.setTitle(cardDefTitle);
        cardDef.setProject(persistedProject);
        Long cardDefId = client.cardDefController.createCardDef(cardDef);

        CardDef persistedCardDef = client.cardDefController.getCardDef(cardDefId);
        Assertions.assertNotNull(persistedCardDef);
        Assertions.assertNotNull(persistedCardDef.getProject());
        Assertions.assertEquals(projectName, persistedCardDef.getProject().getName());
    }
}
