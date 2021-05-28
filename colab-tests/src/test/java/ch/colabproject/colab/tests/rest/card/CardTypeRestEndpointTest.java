/*
 * The coLAB projectOne
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.card;

import ch.colabproject.colab.api.model.ConcretizationCategory;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.card.CardTypeRef;
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
public class CardTypeRestEndpointTest extends AbstractArquillianTest {

    @Test
    public void testCreateCardType() {
        Long projectId = client.projectRestEndpoint.createProject(new Project());
        CardType cardType = createCardType(projectId);

        Assertions.assertNotNull(cardType);
        Assertions.assertNotNull(cardType.getId());
        Assertions.assertNull(cardType.getUniqueId());
        Assertions.assertNull(cardType.getTitle());
        Assertions.assertNull(cardType.getPurpose());
        Assertions.assertNull(cardType.getAuthorityHolder());
        Assertions.assertEquals(projectId, cardType.getProjectId());
    }

    @Test
    public void testCreateAndUseGlobalCardType() {
        // -----
        // Global type
        // -----
        CardType globalType = this.createCardType(null);

        // -----
        // Global type is used by projectOne
        // -----
        Project projectOne = this.createProject("Project One");
        List<AbstractCardType> types = client.projectRestEndpoint.getCardTypesOfProject(projectOne.getId());
        Assertions.assertEquals(0, types.size());

        Card rootCard = client.cardRestEndpoint.getCard(projectOne.getRootCardId());
        Long rootCardId = rootCard.getId();

        List<CardContent> rootCardContents = client.cardRestEndpoint
            .getContentVariantsOfCard(rootCardId);
        Long parentId = rootCardContents.get(0).getId();

        // create a card based on a global type
        Card card = client.cardRestEndpoint.createNewCard(parentId, globalType.getId());
        Long cardId = card.getId();

        // assert the proejct now contains a CardTypeRef to the global type
        types = client.projectRestEndpoint.getCardTypesOfProject(projectOne.getId());
        Assertions.assertEquals(1, types.size());
        AbstractCardType theType = types.get(0);
        Assertions.assertTrue(theType instanceof CardTypeRef);

        CardTypeRef projectOneRef = (CardTypeRef) theType;
        Assertions.assertEquals(projectOne.getId(), projectOneRef.getProjectId());
        Assertions.assertEquals(globalType.getId(), projectOneRef.getAbstractCardTypeId());

        // -----
        // ProjectOne type is used by projectTwo
        // -----
        Project projectTwo = this.createProject("Project Two");

        rootCard = client.cardRestEndpoint.getCard(projectTwo.getRootCardId());
        rootCardId = rootCard.getId();

        rootCardContents = client.cardRestEndpoint
            .getContentVariantsOfCard(rootCardId);
        parentId = rootCardContents.get(0).getId();

        // create a card based on projectOne type
        card = client.cardRestEndpoint.createNewCard(parentId, projectOneRef.getId());
        cardId = card.getId();

        // assert the proejct now contains a CardTypeRef to the project one type
        types = client.projectRestEndpoint.getCardTypesOfProject(projectTwo.getId());
        Assertions.assertEquals(1, types.size());
        theType = types.get(0);
        Assertions.assertTrue(theType instanceof CardTypeRef);

        CardTypeRef projectTwoRef = (CardTypeRef) theType;
        Assertions.assertEquals(projectTwo.getId(), projectTwoRef.getProjectId());
        Assertions.assertEquals(projectOneRef.getId(), projectTwoRef.getAbstractCardTypeId());

    }

    @Test
    public void testUpdateCardType() {
        Long projectId = client.projectRestEndpoint.createProject(new Project());

        // String uniqueId = String.valueOf(new Date().getTime() + ((long)(Math.random()
        // * 1000)));
        String title = "Dissemination " + ((int) (Math.random() * 1000));
        String purpose = "Define how the project will be promoted "
            + ((int) (Math.random() * 1000));
        ConcretizationCategory authorityHolder = ConcretizationCategory.PROJECT;

        CardType cardType = this.createCardType(projectId);

        Assertions.assertNull(cardType.getUniqueId());
        Assertions.assertNull(cardType.getTitle());
        Assertions.assertNull(cardType.getPurpose());
        Assertions.assertNull(cardType.getAuthorityHolder());

        // cardType.setUniqueId(uniqueId);
        cardType.setTitle(title);
        cardType.setPurpose(purpose);
        cardType.setAuthorityHolder(authorityHolder);
        client.cardTypeRestEndpoint.updateCardType(cardType);

        CardType persistedCardType = client.cardTypeRestEndpoint.getCardType(cardType.getId());
        // Assertions.assertEquals(uniqueId, persistedCardType2.getUniqueId());
        Assertions.assertEquals(title, persistedCardType.getTitle());
        Assertions.assertEquals(purpose, persistedCardType.getPurpose());
        // Assertions.assertEquals(authorityHolder,
        // persistedCardType2.getAuthorityHolderType());
    }

    @Test
    public void testGetAllCardTypes() {
        Long projectId = client.projectRestEndpoint.createProject(new Project());
        int initialSize = client.cardTypeRestEndpoint.getAllCardTypes().size();

        CardType cardType1 = this.createCardType(projectId);
        cardType1.setTitle("Game design " + ((int) (Math.random() * 1000)));
        client.cardTypeRestEndpoint.updateCardType(cardType1);

        CardType cardType2 = this.createCardType(projectId);
        cardType2.setTitle("Game rules " + ((int) (Math.random() * 1000)));
        client.cardTypeRestEndpoint.updateCardType(cardType2);

        List<CardType> cardTypes = client.cardTypeRestEndpoint.getAllCardTypes();
        Assertions.assertEquals(initialSize + 2, cardTypes.size());
    }

    @Test
    public void testDeleteCardType() {
        Long projectId = client.projectRestEndpoint.createProject(new Project());

        CardType cardType = this.createCardType(projectId);
        Long cardTypeId = cardType.getId();

        CardType persistedCardType = client.cardTypeRestEndpoint.getCardType(cardTypeId);
        Assertions.assertNotNull(persistedCardType);

        client.cardTypeRestEndpoint.deleteCardType(cardTypeId);

        persistedCardType = client.cardTypeRestEndpoint.getCardType(cardTypeId);
        Assertions.assertNull(persistedCardType);
    }

    @Test
    public void testProjectAccess() {
        String projectName = "Easy learn german " + ((int) (Math.random() * 1000));

        Project project = this.createProject(projectName);
        Long projectId = project.getId();

        CardType cardType = this.createCardType(projectId);
        Long cardTypeId = cardType.getId();

        Assertions.assertEquals(projectId, cardType.getProjectId());

        List<AbstractCardType> cardTypesOfProject = client.projectRestEndpoint.getCardTypesOfProject(projectId);
        Assertions.assertNotNull(cardTypesOfProject);
        Assertions.assertEquals(1, cardTypesOfProject.size());
        Assertions.assertEquals(cardTypeId, cardTypesOfProject.get(0).getId());
    }
}
