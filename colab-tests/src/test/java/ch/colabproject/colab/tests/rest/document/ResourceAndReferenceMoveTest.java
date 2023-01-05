/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.ExternalLink;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.rest.document.bean.ResourceCreationData;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage.MessageCode;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import ch.colabproject.colab.tests.tests.TestHelper;
import java.text.MessageFormat;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of the resource rest end point from a client point of view.
 * <p>
 * Focus on moving a card.
 *
 * @author sandra
 */
public class ResourceAndReferenceMoveTest extends AbstractArquillianTest {

    // *********************************************************************************************
    // Move a card
    // *********************************************************************************************

    @Test
    public void testReferenceSpreadWhenMoveCard() {
        ///////////////////////////////////////////
        // creation of the context : project, local card types, cards

        Project project = ColabFactory.createProject(client, "testMoveCard");

        // local type one
        CardType localTypeOne = ColabFactory.createCardType(client, project);
        ResourceCreationData localTypeOneResourceCreation = new ResourceCreationData();
        localTypeOneResourceCreation.setTitle("local type one resource");
        localTypeOneResourceCreation.setDocuments(List.of(new ExternalLink()));
        localTypeOneResourceCreation.setAbstractCardTypeId(localTypeOne.getId());
        Long localTypeOneResourceId = client.resourceRestEndpoint
            .createResource(localTypeOneResourceCreation);
        client.resourceRestEndpoint.publishResource(localTypeOneResourceId);
        /* Resource localTypeOneResource = (Resource) */client.resourceRestEndpoint
            .getAbstractResource(localTypeOneResourceId);

        // local type two
        CardType localTypeTwo = ColabFactory.createCardType(client, project);
        ResourceCreationData localTypeTwoResourceCreation = new ResourceCreationData();
        localTypeTwoResourceCreation.setTitle("local type two resource");
        localTypeTwoResourceCreation.setDocuments(List.of(new ExternalLink()));
        localTypeTwoResourceCreation.setAbstractCardTypeId(localTypeTwo.getId());
        Long localTypeTwoResourceId = client.resourceRestEndpoint
            .createResource(localTypeTwoResourceCreation);
        client.resourceRestEndpoint.publishResource(localTypeTwoResourceId);
        Resource localTypeTwoResource = (Resource) client.resourceRestEndpoint
            .getAbstractResource(localTypeTwoResourceId);

        // root card
        Card rootCard = ColabFactory.getRootCard(client, project);
        CardContent rootCardContent = ColabFactory.getRootContent(client, project);
        ResourceCreationData rootCardResourceCreation = new ResourceCreationData();
        rootCardResourceCreation.setTitle("root card resource");
        rootCardResourceCreation.setDocuments(List.of(new ExternalLink()));
        rootCardResourceCreation.setCardId(rootCard.getId());
        Long rootCardResourceId = client.resourceRestEndpoint
            .createResource(rootCardResourceCreation);
        client.resourceRestEndpoint.publishResource(rootCardResourceId);
        Resource rootCardResource = (Resource) client.resourceRestEndpoint
            .getAbstractResource(rootCardResourceId);

        // card 1 (first level)
        Card card1 = ColabFactory.createNewCard(client, rootCardContent, localTypeOne);
        CardContent cardContent1 = ColabFactory.getCardContent(client, card1.getId());
        ResourceCreationData card1ResourceCreation = new ResourceCreationData();
        card1ResourceCreation.setTitle("card 1 resource");
        card1ResourceCreation.setDocuments(List.of(new ExternalLink()));
        card1ResourceCreation.setCardId(card1.getId());
        Long card1ResourceId = client.resourceRestEndpoint.createResource(card1ResourceCreation);
        client.resourceRestEndpoint.publishResource(card1ResourceId);
        Resource card1Resource = (Resource) client.resourceRestEndpoint
            .getAbstractResource(card1ResourceId);

        // card 2 (first level)
        Card card2 = ColabFactory.createNewCard(client, rootCardContent, localTypeOne);
        CardContent cardContent2 = ColabFactory.getCardContent(client, card2.getId());
        ResourceCreationData card2ResourceCreation = new ResourceCreationData();
        card2ResourceCreation.setTitle("card 2 resource");
        card2ResourceCreation.setDocuments(List.of(new ExternalLink()));
        card2ResourceCreation.setCardId(card2.getId());
        Long card2ResourceId = client.resourceRestEndpoint.createResource(card2ResourceCreation);
        client.resourceRestEndpoint.publishResource(card2ResourceId);
        Resource card2Resource = (Resource) client.resourceRestEndpoint
            .getAbstractResource(card2ResourceId);

        // sub card 2 (second level)
        Card subCard22 = ColabFactory.createNewCard(client, cardContent2, localTypeOne);
        CardContent subCardContent22 = ColabFactory.getCardContent(client, subCard22.getId());
        ResourceCreationData subCard22ResourceCreation = new ResourceCreationData();
        subCard22ResourceCreation.setTitle("sub card 22 resource");
        subCard22ResourceCreation.setDocuments(List.of(new ExternalLink()));
        subCard22ResourceCreation.setCardId(subCard22.getId());
        Long subCard22ResourceId = client.resourceRestEndpoint
            .createResource(subCard22ResourceCreation);
        client.resourceRestEndpoint.publishResource(subCard22ResourceId);
        Resource subCard22Resource = (Resource) client.resourceRestEndpoint
            .getAbstractResource(subCard22ResourceId);

        // wandering card (initialized as second level)
        Card wanderingCard = ColabFactory.createNewCard(client, cardContent2, localTypeTwo);
        CardContent wanderingCardContent = ColabFactory.getCardContent(client,
            wanderingCard.getId());
        ResourceCreationData wanderingCardResourceCreation = new ResourceCreationData();
        wanderingCardResourceCreation.setTitle("wandering card title");
        wanderingCardResourceCreation.setDocuments(List.of(new ExternalLink()));
        wanderingCardResourceCreation.setCardId(wanderingCard.getId());
        Long wanderingCardResourceId = client.resourceRestEndpoint
            .createResource(wanderingCardResourceCreation);
        client.resourceRestEndpoint.publishResource(wanderingCardResourceId);
        Resource wanderingCardResource = (Resource) client.resourceRestEndpoint
            .getAbstractResource(wanderingCardResourceId);

        // sub wandering card (initialized as third level)
        Card subWanderingCard = ColabFactory
            .createNewCard(client, wanderingCardContent, localTypeTwo);
        CardContent subWanderingCardContent = ColabFactory.getCardContent(client,
            subWanderingCard.getId());
        ResourceCreationData subWanderingCardResourceCreation = new ResourceCreationData();
        subWanderingCardResourceCreation.setTitle("sub wandering card resource");
        subWanderingCardResourceCreation.setDocuments(List.of(new ExternalLink()));
        subWanderingCardResourceCreation.setCardId(subWanderingCard.getId());
        Long subWanderingCardResourceId = client.resourceRestEndpoint
            .createResource(subWanderingCardResourceCreation);
        client.resourceRestEndpoint.publishResource(subWanderingCardResourceId);
        Resource subWanderingCardResource = (Resource) client.resourceRestEndpoint
            .getAbstractResource(subWanderingCardResourceId);

        ///////////////////////////////////////////
        // check initial state under card 2

        checkRelevantResources("initial state", wanderingCardContent,
            List.of(
                rootCardResource,
                card2Resource,
                wanderingCardResource,
                localTypeTwoResource
            ));

        checkResidualResources("initial state", wanderingCardContent,
            List.of(
            ));

        checkRelevantResources("initial state", subWanderingCardContent,
            List.of(
                rootCardResource,
                card2Resource,
                wanderingCardResource,
                localTypeTwoResource,
                subWanderingCardResource
            ));

        checkResidualResources("initial state", subWanderingCardContent,
            List.of(
            ));

        /////////////////////////////////////////
        // move on the same place

        client.cardRestEndpoint.moveCard(wanderingCard.getId(), cardContent2.getId());

        checkRelevantResources("step 0 - move on the same place", wanderingCardContent,
            List.of(
                rootCardResource,
                card2Resource,
                wanderingCardResource,
                localTypeTwoResource
            ));

        checkResidualResources("tep 0 - move on the same place", wanderingCardContent,
            List.of(
            ));

        checkRelevantResources("tep 0 - move on the same place", subWanderingCardContent,
            List.of(
                rootCardResource,
                card2Resource,
                wanderingCardResource,
                localTypeTwoResource,
                subWanderingCardResource
            ));

        checkResidualResources("tep 0 - move on the same place", subWanderingCardContent,
            List.of(
            ));

        ///////////////////////////////////////////
        // move directly under the root

        client.cardRestEndpoint.moveCard(wanderingCard.getId(), rootCardContent.getId());

        checkRelevantResources("step 1 - under the root", wanderingCardContent,
            List.of(
                rootCardResource,
                wanderingCardResource,
                localTypeTwoResource
            ));

        checkResidualResources("step 1 - under the root", wanderingCardContent,
            List.of(
                card2Resource
            ));

        checkRelevantResources("step 1 - under the root", subWanderingCardContent,
            List.of(
                rootCardResource,
                wanderingCardResource,
                localTypeTwoResource,
                subWanderingCardResource
            ));

        checkResidualResources("step 1 - under the root", subWanderingCardContent,
            List.of(
                card2Resource
            ));

        ///////////////////////////////////////////
        // move back under card 2

        client.cardRestEndpoint.moveCard(wanderingCard.getId(), cardContent2.getId());

        checkRelevantResources("step 2 - back under card 2", wanderingCardContent,
            List.of(
                rootCardResource,
                card2Resource,
                wanderingCardResource,
                localTypeTwoResource
            ));

        checkResidualResources("step 2 - back under card 2", wanderingCardContent,
            List.of());

        checkRelevantResources("step 2 - back under card 2", subWanderingCardContent,
            List.of(
                rootCardResource,
                card2Resource,
                wanderingCardResource,
                localTypeTwoResource,
                subWanderingCardResource
            ));

        checkResidualResources("step 2 - back under card 2", subWanderingCardContent,
            List.of());

        ///////////////////////////////////////////
        // move under sub card 22

        client.cardRestEndpoint.moveCard(wanderingCard.getId(), subCardContent22.getId());

        checkRelevantResources("step 3 - move under sub card 22", wanderingCardContent,
            List.of(
                rootCardResource,
                card2Resource,
                subCard22Resource,
                wanderingCardResource,
                localTypeTwoResource
            ));

        checkResidualResources("step 3 - move under sub card 22", wanderingCardContent,
            List.of());

        checkRelevantResources("step 3 - move under sub card 22", subWanderingCardContent,
            List.of(
                rootCardResource,
                card2Resource,
                subCard22Resource,
                wanderingCardResource,
                localTypeTwoResource,
                subWanderingCardResource
            ));

        checkResidualResources("step 3 - move under sub card 22", subWanderingCardContent,
            List.of());

        ///////////////////////////////////////////
        // move back under card 2

        client.cardRestEndpoint.moveCard(wanderingCard.getId(), cardContent2.getId());

        checkRelevantResources("step 4 - back under card 2", wanderingCardContent,
            List.of(
                rootCardResource,
                card2Resource,
                wanderingCardResource,
                localTypeTwoResource
            ));

        checkResidualResources("step 4 - back under card 2", wanderingCardContent,
            List.of(
                subCard22Resource
            ));

        checkRelevantResources("step 4 - back under card 2", subWanderingCardContent,
            List.of(
                rootCardResource,
                card2Resource,
                wanderingCardResource,
                localTypeTwoResource,
                subWanderingCardResource
            ));

        checkResidualResources("step 4 - back under card 2", subWanderingCardContent,
            List.of(
                subCard22Resource
            ));

        ///////////////////////////////////////////
        // move under card 1

        client.cardRestEndpoint.moveCard(wanderingCard.getId(), cardContent1.getId());

        checkRelevantResources("step 5 - under card 1", wanderingCardContent,
            List.of(
                rootCardResource,
                card1Resource,
                wanderingCardResource,
                localTypeTwoResource
            ));

        checkResidualResources("step 5 - under card 1", wanderingCardContent,
            List.of(
                card2Resource,
                subCard22Resource
            ));

        checkRelevantResources("step 5 - under card 1", subWanderingCardContent,
            List.of(
                rootCardResource,
                card1Resource,
                wanderingCardResource,
                localTypeTwoResource,
                subWanderingCardResource
            ));

        checkResidualResources("step 5 - under card 1", subWanderingCardContent,
            List.of(
                card2Resource,
                subCard22Resource
            ));

        ///////////////////////////////////////////
        // move back under card 2

        client.cardRestEndpoint.moveCard(wanderingCard.getId(), cardContent2.getId());

        checkRelevantResources("step 6 - back under card 2", wanderingCardContent,
            List.of(
                rootCardResource,
                card2Resource,
                wanderingCardResource,
                localTypeTwoResource
            ));

        checkResidualResources("step 6 - back under card 2", wanderingCardContent,
            List.of(
                subCard22Resource,
                card1Resource
            ));

        checkRelevantResources("step 6 - back under card 2", subWanderingCardContent,
            List.of(
                rootCardResource,
                card2Resource,
                wanderingCardResource,
                localTypeTwoResource,
                subWanderingCardResource
            ));

        checkResidualResources("step 6 - back under card 2", subWanderingCardContent,
            List.of(
                subCard22Resource,
                card1Resource
            ));

        ///////////////////////////////////////////
        // move under its sub card
        TestHelper.assertThrows(MessageCode.DATA_INTEGRITY_FAILURE, () -> {
            client.cardRestEndpoint.moveCard(wanderingCard.getId(),
                subWanderingCardContent.getId());
        });
    }

    private void checkRelevantResources(String context, CardContent cardContent,
        List<Resource> expectedResources) {
        List<List<AbstractResource>> persistedResourcesAndRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(cardContent.getId());

        List<Long> relevant = persistedResourcesAndRefs.stream()
            .filter(list -> !isResidual(list))
            .map(list -> list.get(list.size() - 1).getId())
            .collect(Collectors.toList());

        for (Resource resource : expectedResources) {
            Assertions.assertTrue(relevant.contains(resource.getId()),
                MessageFormat.format(
                    "For {0}, the wandering card miss the relevant resource \"{1}\"",
                    context, resource.getTitle()));
        }

        Assertions.assertEquals(expectedResources.size(), relevant.size(),
            MessageFormat.format("For {0}, the wandering card must have {1} relevant resources",
                context, Integer.toString(expectedResources.size())));
    }

    private void checkResidualResources(String context, CardContent cardContent,
        List<Resource> expectedResources) {
        List<List<AbstractResource>> persistedResourcesAndRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(cardContent.getId());

        List<Long> residues = persistedResourcesAndRefs.stream()
            .filter(list -> isResidual(list))
            .map(list -> list.get(list.size() - 1).getId())
            .collect(Collectors.toList());

        for (Resource resource : expectedResources) {
            Assertions.assertTrue(residues.contains(resource.getId()),
                MessageFormat.format(
                    "For {0}, the wandering card miss the residual resource \"{1}\"",
                    context, resource.getTitle()));
        }

        Assertions.assertEquals(expectedResources.size(), residues.size(),
            MessageFormat.format("For {0}, the wandering card must have {1} residual resources",
                context, Integer.toString(expectedResources.size())));
    }

    private static boolean isResidual(List<AbstractResource> list) {
        return (list.get(0) instanceof ResourceRef) && ((ResourceRef) list.get(0)).isResidual();
    }

}
