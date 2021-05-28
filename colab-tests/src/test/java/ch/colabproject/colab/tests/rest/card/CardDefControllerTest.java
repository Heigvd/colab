/*
 * The coLAB projectOne
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.card;

import ch.colabproject.colab.api.model.ConcretizationCategory;
import ch.colabproject.colab.api.model.card.AbstractCardDef;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardDef;
import ch.colabproject.colab.api.model.card.CardDefRef;
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
        CardDef cardDef = createCardDef(projectId);

        Assertions.assertNotNull(cardDef);
        Assertions.assertNotNull(cardDef.getId());
        Assertions.assertNull(cardDef.getUniqueId());
        Assertions.assertNull(cardDef.getTitle());
        Assertions.assertNull(cardDef.getPurpose());
        Assertions.assertNull(cardDef.getAuthorityHolder());
        Assertions.assertEquals(projectId, cardDef.getProjectId());
    }

    @Test
    public void testCreateAndUseGlobalCardDef() {
        // -----
        // Global type
        // -----
        CardDef globalType = this.createCardDef(null);

        // -----
        // Global type is used by projectOne
        // -----
        Project projectOne = this.createProject("Project One");
        List<AbstractCardDef> types = client.projectController.getCardDefsOfProject(projectOne.getId());
        Assertions.assertEquals(0, types.size());

        Card rootCard = client.cardController.getCard(projectOne.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardController
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        // create a card based on a global type
        Card card = client.cardController.createNewCard(parentId, globalType.getId());
        Long cardId = card.getId();

        // assert the proejct now contains a CardTypeRef to the global type
        types = client.projectController.getCardDefsOfProject(projectOne.getId());
        Assertions.assertEquals(1, types.size());
        AbstractCardDef theType = types.get(0);
        Assertions.assertTrue(theType instanceof CardDefRef);

        CardDefRef projectOneRef = (CardDefRef) theType;
        Assertions.assertEquals(projectOne.getId(), projectOneRef.getProjectId());
        Assertions.assertEquals(globalType.getId(), projectOneRef.getAbstractCardDefId());

        // -----
        // ProjectOne type is used by projectTwo
        // -----
        Project projectTwo = this.createProject("Project Two");

        rootCard = client.cardController.getCard(projectTwo.getRootCardId());
        rootCardId = rootCard.getId();

        rootCardContents = client.cardController
            .getContentVariantsOfCard(rootCardId);
        parentId = rootCardContents.get(0).getId();

        // create a card based on projectOne type
        card = client.cardController.createNewCard(parentId, projectOneRef.getId());
        cardId = card.getId();

        // assert the proejct now contains a CardTypeRef to the project one type
        types = client.projectController.getCardDefsOfProject(projectTwo.getId());
        Assertions.assertEquals(1, types.size());
        theType = types.get(0);
        Assertions.assertTrue(theType instanceof CardDefRef);

        CardDefRef projectTwoRef = (CardDefRef) theType;
        Assertions.assertEquals(projectTwo.getId(), projectTwoRef.getProjectId());
        Assertions.assertEquals(projectOneRef.getId(), projectTwoRef.getAbstractCardDefId());

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

        CardDef cardDef = this.createCardDef(projectId);

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

        CardDef cardDef1 = this.createCardDef(projectId);
        cardDef1.setTitle("Game design " + ((int) (Math.random() * 1000)));
        client.cardDefController.updateCardDef(cardDef1);

        CardDef cardDef2 = this.createCardDef(projectId);
        cardDef2.setTitle("Game rules " + ((int) (Math.random() * 1000)));
        client.cardDefController.updateCardDef(cardDef2);

        List<CardDef> cardDefs = client.cardDefController.getAllCardDefs();
        Assertions.assertEquals(initialSize + 2, cardDefs.size());
    }

    @Test
    public void testDeleteCardDef() {
        Long projectId = client.projectController.createProject(new Project());

        CardDef cardDef = this.createCardDef(projectId);
        Long cardDefId = cardDef.getId();

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

        Project project = this.createProject(projectName);
        Long projectId = project.getId();

        Project persistedProject = client.projectController.getProject(projectId);

        CardDef cardDef = this.createCardDef(projectId);
        cardDef.setTitle(cardDefTitle);
        cardDef.setProject(persistedProject);
        client.cardDefController.updateCardDef(cardDef);

        Long cardDefId = cardDef.getId();

        CardDef persistedCardDef = client.cardDefController.getCardDef(cardDefId);
        Assertions.assertNotNull(persistedCardDef);
        Assertions.assertNotNull(persistedCardDef.getProjectId());
        Assertions.assertEquals(projectId, persistedCardDef.getProjectId());

        List<AbstractCardDef> cardDefsOfProject = client.projectController.getCardDefsOfProject(projectId);
        Assertions.assertNotNull(cardDefsOfProject);
        Assertions.assertEquals(1, cardDefsOfProject.size());
        Assertions.assertEquals(cardDefId, cardDefsOfProject.get(0).getId());
    }
}
