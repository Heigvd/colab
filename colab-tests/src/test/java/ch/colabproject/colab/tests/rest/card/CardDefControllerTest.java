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
        Long projectId = client.projectController.createProject(new Project());

        CardDef cardDef = client.cardDefController.createNewCardDef(projectId);

        Assertions.assertNotNull(cardDef);
        Assertions.assertNotNull(cardDef.getId());
        Assertions.assertNull(cardDef.getUniqueId());
        Assertions.assertNull(cardDef.getTitle());
        Assertions.assertNull(cardDef.getPurpose());
        Assertions.assertNull(cardDef.getAuthorityHolder());
        Assertions.assertEquals(projectId, cardDef.getProjectId());
    }

    @Test
    public void testUpdateCardDef() {
        Long projectId = client.projectController.createProject(new Project());

        // String uniqueId = String.valueOf(new Date().getTime() + ((long)(Math.random()
        // * 1000)));
        String title = "Dissemination " + ((int) (Math.random() * 1000));
        String purpose = "Define how the project will be promoted "
                + ((int) (Math.random() * 1000));
        ConcretizationCategory authorityHolder = ConcretizationCategory.PROJECT;

        CardDef cardDef = client.cardDefController.createNewCardDef(projectId);

        Assertions.assertNull(cardDef.getUniqueId());
        Assertions.assertNull(cardDef.getTitle());
        Assertions.assertNull(cardDef.getPurpose());
        Assertions.assertNull(cardDef.getAuthorityHolder());

        // cardDef.setUniqueId(uniqueId);
        cardDef.setTitle(title);
        cardDef.setPurpose(purpose);
        cardDef.setAuthorityHolder(authorityHolder);
        client.cardDefController.updateCardDef(cardDef);

        CardDef persistedCardDef = client.cardDefController.getCardDef(cardDef.getId());
        // Assertions.assertEquals(uniqueId, persistedCardDef2.getUniqueId());
        Assertions.assertEquals(title, persistedCardDef.getTitle());
        Assertions.assertEquals(purpose, persistedCardDef.getPurpose());
        // Assertions.assertEquals(authorityHolder,
        // persistedCardDef2.getAuthorityHolderType());
    }

    @Test
    public void testGetAllCardDefs() {
        Long projectId = client.projectController.createProject(new Project());
        int initialSize = client.cardDefController.getAllCardDefs().size();

        CardDef cardDef1 = client.cardDefController.createNewCardDef(projectId);
        cardDef1.setTitle("Game design " + ((int) (Math.random() * 1000)));
        client.cardDefController.updateCardDef(cardDef1);

        CardDef cardDef2 = client.cardDefController.createNewCardDef(projectId);
        cardDef2.setTitle("Game rules " + ((int) (Math.random() * 1000)));
        client.cardDefController.updateCardDef(cardDef2);

        List<CardDef> cardDefs = client.cardDefController.getAllCardDefs();
        Assertions.assertEquals(initialSize + 2, cardDefs.size());
    }

    @Test
    public void testDeleteCardDef() {
        Long projectId = client.projectController.createProject(new Project());

        Long cardDefId = client.cardDefController.createNewCardDef(projectId).getId();

        CardDef persistedCardDef = client.cardDefController.getCardDef(cardDefId);
        Assertions.assertNotNull(persistedCardDef);

        client.cardDefController.deleteCardDef(cardDefId);

        persistedCardDef = client.cardDefController.getCardDef(cardDefId);
        Assertions.assertNull(persistedCardDef);
    }

    @Test
    public void testProjectAccess() {
        String projectName = "Easy learn german " + ((int) (Math.random() * 1000));

        Project project = new Project();
        project.setName(projectName);
        Long projectId = client.projectController.createProject(project);

        CardDef cardDef = client.cardDefController.createNewCardDef(projectId);
        Long cardDefId = cardDef.getId();

        Assertions.assertEquals(projectId, cardDef.getProjectId());

        List<CardDef> cardDefsOfProject = client.projectController.getCardDefsOfProject(projectId);
        Assertions.assertNotNull(cardDefsOfProject);
        Assertions.assertEquals(1, cardDefsOfProject.size());
        Assertions.assertEquals(cardDefId, cardDefsOfProject.get(0).getId());
    }
}
