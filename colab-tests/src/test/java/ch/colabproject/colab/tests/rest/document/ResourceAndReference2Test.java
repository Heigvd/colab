/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.BlockDocument;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.rest.document.ResourceCreationBean;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of the resource rest end point from a client point of view
 *
 * @author sandra
 */
public class ResourceAndReference2Test extends AbstractArquillianTest {

    // *********************************************************************************************
    // References life cycle
    // *********************************************************************************************

    @Test
    public void testReferenceSpreadFirstResourceThenNewData() {
        // creation of the context : project, global card types, card type, card, sub card
        Project project = ColabFactory.createProject(client, "testResource");
        Long projectId = project.getId();

        Long rootCardId = ColabFactory.getRootCard(client, project).getId();
        ResourceCreationBean rootCardResource = new ResourceCreationBean();
        rootCardResource.setDocument(new BlockDocument());
        rootCardResource.setCardId(rootCardId);
        Long rootCardResourceId = client.resourceRestEndpoint.createResource(rootCardResource);

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();
        ResourceCreationBean rootCardContentResource = new ResourceCreationBean();
        rootCardContentResource.setDocument(new BlockDocument());
        rootCardContentResource.setCardContentId(rootCardContentId);
        Long rootCardContentResourceId = client.resourceRestEndpoint
            .createResource(rootCardContentResource);

        Long rootCardVariantId = ColabFactory.createNewCardContent(client, rootCardId).getId();
        ResourceCreationBean rootCardVariantResource = new ResourceCreationBean();
        rootCardVariantResource.setDocument(new BlockDocument());
        rootCardVariantResource.setCardContentId(rootCardVariantId);
        client.resourceRestEndpoint.createResource(rootCardVariantResource);
        // referenced by nothing

        Long globalCardTypeId = ColabFactory.createCardType(client, null).getId();
        ResourceCreationBean globalCardTypeResource = new ResourceCreationBean();
        globalCardTypeResource.setDocument(new BlockDocument());
        globalCardTypeResource.setAbstractCardTypeId(globalCardTypeId);
        Long globalCardTypeResourceId = client.resourceRestEndpoint
            .createResource(globalCardTypeResource);

        Long card1Id = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId)
            .getId();
        ResourceCreationBean card1Resource = new ResourceCreationBean();
        card1Resource.setDocument(new BlockDocument());
        card1Resource.setCardId(card1Id);
        Long card1ResourceId = client.resourceRestEndpoint.createResource(card1Resource);

        Long card1GlobalTypeRefId = client.cardRestEndpoint.getCard(card1Id).getCardTypeId();
        ResourceCreationBean card1GlobalTypeRefResource = new ResourceCreationBean();
        card1GlobalTypeRefResource.setDocument(new BlockDocument());
        card1GlobalTypeRefResource.setAbstractCardTypeId(card1GlobalTypeRefId);
        Long card1GlobalTypeRefResourceId = client.resourceRestEndpoint
            .createResource(card1GlobalTypeRefResource);

        Long card1ContentId = ColabFactory.getCardContent(client, card1Id).getId();
        ResourceCreationBean card1ContentResource = new ResourceCreationBean();
        card1ContentResource.setDocument(new BlockDocument());
        card1ContentResource.setCardContentId(card1ContentId);
        Long card1ContentResourceId = client.resourceRestEndpoint
            .createResource(card1ContentResource);

        Long card2LocalTypeId = ColabFactory.createCardType(client, projectId).getId();
        ResourceCreationBean card2LocalTypeResource = new ResourceCreationBean();
        card2LocalTypeResource.setDocument(new BlockDocument());
        card2LocalTypeResource.setAbstractCardTypeId(card2LocalTypeId);
        Long card2LocalTypeResourceId = client.resourceRestEndpoint
            .createResource(card2LocalTypeResource);

        Long card2Id = ColabFactory.createNewCard(client, rootCardContentId, card2LocalTypeId)
            .getId();
        ResourceCreationBean card2Resource = new ResourceCreationBean();
        card2Resource.setDocument(new BlockDocument());
        card2Resource.setCardId(card2Id);
        Long card2ResourceId = client.resourceRestEndpoint.createResource(card2Resource);

        Long card2ContentId = ColabFactory.getCardContent(client, card2Id).getId();
        ResourceCreationBean card2ContentResource = new ResourceCreationBean();
        card2ContentResource.setDocument(new BlockDocument());
        card2ContentResource.setCardContentId(card2ContentId);
        Long card2ContentResourceId = client.resourceRestEndpoint
            .createResource(card2ContentResource);

        // now add variants and cards and check that all resources are spread

        Long anotherGlobalCardTypeId = ColabFactory.createCardType(client, null).getId();
        ResourceCreationBean anotherGlobalCardTypeResource = new ResourceCreationBean();
        anotherGlobalCardTypeResource.setDocument(new BlockDocument());
        anotherGlobalCardTypeResource.setAbstractCardTypeId(anotherGlobalCardTypeId);
        Long anotherGlobalCardTypeResourceId = client.resourceRestEndpoint
            .createResource(anotherGlobalCardTypeResource);

        Long anotherLocalCardTypeId = ColabFactory.createCardType(client, projectId).getId();
        ResourceCreationBean anotherLocalCardTypeResource = new ResourceCreationBean();
        anotherLocalCardTypeResource.setDocument(new BlockDocument());
        anotherLocalCardTypeResource.setAbstractCardTypeId(anotherLocalCardTypeId);
        Long anotherLocalCardTypeResourceId = client.resourceRestEndpoint
            .createResource(anotherLocalCardTypeResource);

        List<List<AbstractResource>> persistedResourcesAndRefs;
        List<Long> actual;

        Long newVariant1Id = ColabFactory.createNewCardContent(client, card1Id).getId();
        persistedResourcesAndRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(newVariant1Id);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId())
            .collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(globalCardTypeResourceId));
        Assertions.assertTrue(actual.contains(card1GlobalTypeRefResourceId));
        Assertions.assertTrue(actual.contains(card1ResourceId));
        Assertions.assertEquals(5, actual.size());

        Long newCard1gId = ColabFactory
            .createNewCard(client, card1ContentId, anotherGlobalCardTypeId).getId();
        Long newCard1gContentId = ColabFactory.getCardContent(client, newCard1gId).getId();
        persistedResourcesAndRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(newCard1gContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId())
            .collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card1ResourceId));
        Assertions.assertTrue(actual.contains(card1ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherGlobalCardTypeResourceId));
        Assertions.assertEquals(5, actual.size());

        Long newCard1lId = ColabFactory
            .createNewCard(client, card1ContentId, anotherLocalCardTypeId).getId();
        Long newCard1lContentId = ColabFactory.getCardContent(client, newCard1lId).getId();
        persistedResourcesAndRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(newCard1lContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId())
            .collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card1ResourceId));
        Assertions.assertTrue(actual.contains(card1ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherLocalCardTypeResourceId));
        Assertions.assertEquals(5, actual.size());

        Long newVariant2Id = ColabFactory.createNewCardContent(client, card2Id).getId();
        persistedResourcesAndRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(newVariant2Id);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId())
            .collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card2LocalTypeResourceId));
        Assertions.assertTrue(actual.contains(card2ResourceId));
        Assertions.assertEquals(4, actual.size());

        Long newCard2gId = ColabFactory
            .createNewCard(client, card2ContentId, anotherGlobalCardTypeId).getId();
        Long newCard2gContentId = ColabFactory.getCardContent(client, newCard2gId).getId();
        persistedResourcesAndRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(newCard2gContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId())
            .collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card2ResourceId));
        Assertions.assertTrue(actual.contains(card2ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherGlobalCardTypeResourceId));
        Assertions.assertEquals(5, actual.size());

        Long newCard2lId = ColabFactory
            .createNewCard(client, card2ContentId, anotherLocalCardTypeId).getId();
        Long newCard2lContentId = ColabFactory.getCardContent(client, newCard2lId).getId();
        persistedResourcesAndRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(newCard2lContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId())
            .collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card2ResourceId));
        Assertions.assertTrue(actual.contains(card2ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherLocalCardTypeResourceId));
        Assertions.assertEquals(5, actual.size());
    }

    // a similar test but creating the resources after everything else is made in {@link
    // ResourceAndReferenceTest}

    @Test
    public void testReferenceSpreadFirstDataThenResources() {
        // creation of the context : project, global card types, card type, card, sub card
        Project project = ColabFactory.createProject(client, "testResource");
        Long projectId = project.getId();

        Long rootCardId = ColabFactory.getRootCard(client, project).getId();

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        Long rootCardVariantId = ColabFactory.createNewCardContent(client, rootCardId).getId();
        // referenced by nothing

        Long globalCardTypeId = ColabFactory.createCardType(client, null).getId();

        Long card1Id = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId)
            .getId();

        Long card1GlobalTypeRefId = client.cardRestEndpoint.getCard(card1Id).getCardTypeId();

        Long card1ContentId = ColabFactory.getCardContent(client, card1Id).getId();

        Long card2LocalTypeId = ColabFactory.createCardType(client, projectId).getId();

        Long card2Id = ColabFactory.createNewCard(client, rootCardContentId, card2LocalTypeId)
            .getId();

        Long card2ContentId = ColabFactory.getCardContent(client, card2Id).getId();

        Long anotherGlobalCardTypeId = ColabFactory.createCardType(client, null).getId();

        Long anotherLocalCardTypeId = ColabFactory.createCardType(client, projectId).getId();

        Long newVariant1Id = ColabFactory.createNewCardContent(client, card1Id).getId();

        Long newCard1gId = ColabFactory
            .createNewCard(client, card1ContentId, anotherGlobalCardTypeId).getId();
        Long newCard1gContentId = ColabFactory.getCardContent(client, newCard1gId).getId();

        Long newCard1lId = ColabFactory
            .createNewCard(client, card1ContentId, anotherLocalCardTypeId).getId();
        Long newCard1lContentId = ColabFactory.getCardContent(client, newCard1lId).getId();

        Long newVariant2Id = ColabFactory.createNewCardContent(client, card2Id).getId();

        Long newCard2gId = ColabFactory
            .createNewCard(client, card2ContentId, anotherGlobalCardTypeId).getId();
        Long newCard2gContentId = ColabFactory.getCardContent(client, newCard2gId).getId();

        Long newCard2lId = ColabFactory
            .createNewCard(client, card2ContentId, anotherLocalCardTypeId).getId();
        Long newCard2lContentId = ColabFactory.getCardContent(client, newCard2lId).getId();

        // now add resources
        ResourceCreationBean rootCardResource = new ResourceCreationBean();
        rootCardResource.setDocument(new BlockDocument());
        rootCardResource.setCardId(rootCardId);
        Long rootCardResourceId = client.resourceRestEndpoint.createResource(rootCardResource);

        ResourceCreationBean rootCardContentResource = new ResourceCreationBean();
        rootCardContentResource.setDocument(new BlockDocument());
        rootCardContentResource.setCardContentId(rootCardContentId);
        Long rootCardContentResourceId = client.resourceRestEndpoint
            .createResource(rootCardContentResource);

        ResourceCreationBean rootCardVariantResource = new ResourceCreationBean();
        rootCardVariantResource.setDocument(new BlockDocument());
        rootCardVariantResource.setCardContentId(rootCardVariantId);
        client.resourceRestEndpoint.createResource(rootCardVariantResource);

        ResourceCreationBean globalCardTypeResource = new ResourceCreationBean();
        globalCardTypeResource.setDocument(new BlockDocument());
        globalCardTypeResource.setAbstractCardTypeId(globalCardTypeId);
        Long globalCardTypeResourceId = client.resourceRestEndpoint
            .createResource(globalCardTypeResource);

        ResourceCreationBean card1Resource = new ResourceCreationBean();
        card1Resource.setDocument(new BlockDocument());
        card1Resource.setCardId(card1Id);
        Long card1ResourceId = client.resourceRestEndpoint.createResource(card1Resource);

        ResourceCreationBean card1GlobalTypeRefResource = new ResourceCreationBean();
        card1GlobalTypeRefResource.setDocument(new BlockDocument());
        card1GlobalTypeRefResource.setAbstractCardTypeId(card1GlobalTypeRefId);
        Long card1GlobalTypeRefResourceId = client.resourceRestEndpoint
            .createResource(card1GlobalTypeRefResource);

        ResourceCreationBean card1ContentResource = new ResourceCreationBean();
        card1ContentResource.setDocument(new BlockDocument());
        card1ContentResource.setCardContentId(card1ContentId);
        Long card1ContentResourceId = client.resourceRestEndpoint
            .createResource(card1ContentResource);

        ResourceCreationBean card2LocalTypeResource = new ResourceCreationBean();
        card2LocalTypeResource.setDocument(new BlockDocument());
        card2LocalTypeResource.setAbstractCardTypeId(card2LocalTypeId);
        Long card2LocalTypeResourceId = client.resourceRestEndpoint
            .createResource(card2LocalTypeResource);

        ResourceCreationBean card2Resource = new ResourceCreationBean();
        card2Resource.setDocument(new BlockDocument());
        card2Resource.setCardId(card2Id);
        Long card2ResourceId = client.resourceRestEndpoint.createResource(card2Resource);

        ResourceCreationBean card2ContentResource = new ResourceCreationBean();
        card2ContentResource.setDocument(new BlockDocument());
        card2ContentResource.setCardContentId(card2ContentId);
        Long card2ContentResourceId = client.resourceRestEndpoint
            .createResource(card2ContentResource);

        ResourceCreationBean anotherGlobalCardTypeResource = new ResourceCreationBean();
        anotherGlobalCardTypeResource.setDocument(new BlockDocument());
        anotherGlobalCardTypeResource.setAbstractCardTypeId(anotherGlobalCardTypeId);
        Long anotherGlobalCardTypeResourceId = client.resourceRestEndpoint
            .createResource(anotherGlobalCardTypeResource);

        ResourceCreationBean anotherLocalCardTypeResource = new ResourceCreationBean();
        anotherLocalCardTypeResource.setDocument(new BlockDocument());
        anotherLocalCardTypeResource.setAbstractCardTypeId(anotherLocalCardTypeId);
        Long anotherLocalCardTypeResourceId = client.resourceRestEndpoint
            .createResource(anotherLocalCardTypeResource);

        // now see how the resources are spread
        List<List<AbstractResource>> persistedResourcesAndRefs;
        List<Long> actual;
        persistedResourcesAndRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(newVariant1Id);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId())
            .collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card1ResourceId));
        Assertions.assertTrue(actual.contains(globalCardTypeResourceId));
        Assertions.assertTrue(actual.contains(card1GlobalTypeRefResourceId));
        Assertions.assertEquals(5, actual.size());

        persistedResourcesAndRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(newCard1gContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId())
            .collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card1ResourceId));
        Assertions.assertTrue(actual.contains(card1ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherGlobalCardTypeResourceId));
        Assertions.assertEquals(5, actual.size());

        persistedResourcesAndRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(newCard1lContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId())
            .collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card1ResourceId));
        Assertions.assertTrue(actual.contains(card1ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherLocalCardTypeResourceId));
        Assertions.assertEquals(5, actual.size());

        persistedResourcesAndRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(newVariant2Id);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId())
            .collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card2ResourceId));
        Assertions.assertTrue(actual.contains(card2LocalTypeResourceId));
        Assertions.assertEquals(4, actual.size());

        persistedResourcesAndRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(newCard2gContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId())
            .collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card2ResourceId));
        Assertions.assertTrue(actual.contains(card2ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherGlobalCardTypeResourceId));
        Assertions.assertEquals(5, actual.size());

        persistedResourcesAndRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(newCard2lContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId())
            .collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card2ResourceId));
        Assertions.assertTrue(actual.contains(card2ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherLocalCardTypeResourceId));
        Assertions.assertEquals(5, actual.size());
    }

}
