/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.BlockDocument;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.ExternalLink;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.rest.document.ResourceCreationBean;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import com.google.common.collect.Lists;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of the resource rest end point from a client point of view
 *
 * @author sandra
 */
// TODO refuse stuff
// TODO publish / requestForGlory / deprecated stuff
public class ResourceRestEndpointTest extends AbstractArquillianTest {

    // *********************************************************************************************
    // Resource
    // *********************************************************************************************

    @Test
    public void testCreateResource() {
        // creation of the context : global card type
        Long globalCardTypeId = ColabFactory.createCardType(client, null).getId();

        String title = "the guide " + ((int) (Math.random() * 1000));
        String teaser = "everything you need to know " + ((int) (Math.random() * 1000));
        String category = "awesome resources #" + ((int) (Math.random() * 1000));
        String url = "http://www.123soleil.chat/theGameEncyclopedia.pdf";

        ExternalLink doc = new ExternalLink();
        doc.setUrl(url);

        TextDataBlock teaserBlock = TextDataBlock.initNewDefaultTextDataBlock();
        teaserBlock.setTextData(teaser);

        ResourceCreationBean resourceCreationBean = new ResourceCreationBean();

        resourceCreationBean.setTitle(title);
        resourceCreationBean.setTeaser(teaserBlock);
        resourceCreationBean.setDocument(doc);
        resourceCreationBean.setCategory(category);
        resourceCreationBean.setAbstractCardTypeId(globalCardTypeId);

        Long resourceId = client.resourceRestEndpoint.createResource(resourceCreationBean);

        Resource persistedResource = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resourceId);
        Assertions.assertNotNull(persistedResource);
        Assertions.assertNotNull(persistedResource.getId());
        Assertions.assertEquals(resourceId, persistedResource.getId());
        Assertions.assertEquals(title, persistedResource.getTitle());
        Assertions.assertFalse(persistedResource.isPublished());
        Assertions.assertFalse(persistedResource.isRequestingForGlory());
        Assertions.assertFalse(persistedResource.isDeprecated());

        Assertions.assertNotNull(persistedResource.getDocumentId());
        Document persistedDocument = client.documentRestEndPoint
            .getDocument(persistedResource.getDocumentId());
        Assertions.assertNotNull(persistedDocument);
        Assertions.assertTrue(persistedDocument instanceof ExternalLink);
        ExternalLink persistedExtDoc = (ExternalLink) persistedDocument;
        Assertions.assertEquals(url, persistedExtDoc.getUrl());
        Assertions.assertNull(persistedExtDoc.getDeliverableCardContentId());
        Assertions.assertEquals(resourceId, persistedExtDoc.getResourceId());

        Assertions.assertNotNull(persistedResource.getTeaserId());
        Block persistedTeaserBlock = client.blockRestEndPoint
            .getBlock(persistedResource.getTeaserId());
        Assertions.assertNotNull(persistedTeaserBlock);
        Assertions.assertTrue(persistedTeaserBlock instanceof TextDataBlock);
        TextDataBlock persistedTeaserTextDataBlock = (TextDataBlock) persistedTeaserBlock;
        Assertions.assertNull(persistedTeaserTextDataBlock.getDocumentId());
        Assertions.assertEquals(persistedTeaserTextDataBlock.getMimeType(),
            TextDataBlock.DEFAULT_MIME_TYPE);
        Assertions.assertEquals(persistedTeaserTextDataBlock.getTextData(), teaser);
    }

    @Test
    public void testUpdateResource() {
        // creation of the context : global card type
        Long globalCardTypeId = ColabFactory.createCardType(client, null).getId();

        String url = "http://www.123soleil.chat/theGameEncyclopedia.pdf";

        ExternalLink doc = new ExternalLink();
        doc.setUrl(url);

        ResourceCreationBean resourceCreationBean = new ResourceCreationBean();
        resourceCreationBean.setAbstractCardTypeId(globalCardTypeId);
        resourceCreationBean.setDocument(doc);

        Long resourceId = client.resourceRestEndpoint.createResource(resourceCreationBean);

        Resource persistedResource = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resourceId);
        Assertions.assertNotNull(persistedResource);
        Assertions.assertNotNull(persistedResource.getId());
        Assertions.assertEquals(resourceId, persistedResource.getId());
        Assertions.assertNull(persistedResource.getTitle());
        Assertions.assertFalse(persistedResource.isPublished());
        Assertions.assertFalse(persistedResource.isRequestingForGlory());
        Assertions.assertFalse(persistedResource.isDeprecated());

        Assertions.assertNotNull(persistedResource.getDocumentId());
        Document persistedDocument = client.documentRestEndPoint
            .getDocument(persistedResource.getDocumentId());
        Assertions.assertNotNull(persistedDocument);
        Assertions.assertTrue(persistedDocument instanceof ExternalLink);
        ExternalLink persistedExtDoc = (ExternalLink) persistedDocument;
        Assertions.assertEquals(url, persistedExtDoc.getUrl());
        Assertions.assertNull(persistedExtDoc.getDeliverableCardContentId());
        Assertions.assertEquals(resourceId, persistedExtDoc.getResourceId());

        Assertions.assertNotNull(persistedResource.getTeaserId());
        Block persistedTeaserBlock = client.blockRestEndPoint
            .getBlock(persistedResource.getTeaserId());
        Assertions.assertNotNull(persistedTeaserBlock);
        Assertions.assertTrue(persistedTeaserBlock instanceof TextDataBlock);
        TextDataBlock persistedTeaserTextDataBlock = (TextDataBlock) persistedTeaserBlock;
        Assertions.assertNull(persistedTeaserTextDataBlock.getDocumentId());
        Assertions.assertEquals(persistedTeaserTextDataBlock.getMimeType(),
            TextDataBlock.DEFAULT_MIME_TYPE);
        Assertions.assertNull(persistedTeaserTextDataBlock.getTextData());

        String title = "the guide " + ((int) (Math.random() * 1000));
        String category = "awesome resources #" + ((int) (Math.random() * 1000));

        persistedResource.setTitle(title);
        persistedResource.setCategory(category);
        persistedResource.setPublished(true);
        persistedResource.setRequestingForGlory(true);
        persistedResource.setDeprecated(true);

        client.resourceRestEndpoint.updateResource(persistedResource);

        persistedResource = (Resource) client.resourceRestEndpoint.getAbstractResource(resourceId);
        Assertions.assertNotNull(persistedResource);
        Assertions.assertNotNull(persistedResource.getId());
        Assertions.assertEquals(resourceId, persistedResource.getId());
        Assertions.assertEquals(title, persistedResource.getTitle());
        Assertions.assertTrue(persistedResource.isPublished());
        Assertions.assertTrue(persistedResource.isRequestingForGlory());
        Assertions.assertTrue(persistedResource.isDeprecated());
        Assertions.assertEquals(category, persistedResource.getCategory());

        Assertions.assertNotNull(persistedResource.getDocumentId());
        persistedDocument = client.documentRestEndPoint
            .getDocument(persistedResource.getDocumentId());
        Assertions.assertNotNull(persistedDocument);
        Assertions.assertTrue(persistedDocument instanceof ExternalLink);
        persistedExtDoc = (ExternalLink) persistedDocument;
        Assertions.assertEquals(url, persistedExtDoc.getUrl());
        Assertions.assertNull(persistedExtDoc.getDeliverableCardContentId());
        Assertions.assertEquals(resourceId, persistedExtDoc.getResourceId());

        Assertions.assertNotNull(persistedResource.getTeaserId());
        persistedTeaserBlock = client.blockRestEndPoint.getBlock(persistedResource.getTeaserId());
        Assertions.assertNotNull(persistedTeaserBlock);
        Assertions.assertTrue(persistedTeaserBlock instanceof TextDataBlock);
        persistedTeaserTextDataBlock = (TextDataBlock) persistedTeaserBlock;
        Assertions.assertNull(persistedTeaserTextDataBlock.getDocumentId());
        Assertions.assertEquals(persistedTeaserTextDataBlock.getMimeType(),
            TextDataBlock.DEFAULT_MIME_TYPE);
        Assertions.assertNull(persistedTeaserTextDataBlock.getTextData());
    }

    @Test
    public void testDeleteResource() {
        // creation of the context : global card type
        Long globalCardTypeId = ColabFactory.createCardType(client, null).getId();

        String url = "http://www.123soleil.chat/theGameEncyclopedia.pdf";

        ExternalLink doc = new ExternalLink();
        doc.setUrl(url);

        ResourceCreationBean resourceCreationBean = new ResourceCreationBean();
        resourceCreationBean.setAbstractCardTypeId(globalCardTypeId);
        resourceCreationBean.setDocument(doc);

        Long resourceId = client.resourceRestEndpoint.createResource(resourceCreationBean);

        Resource persistedResource = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resourceId);
        Assertions.assertNotNull(persistedResource);

        Assertions.assertNotNull(persistedResource.getDocumentId());
        Long docId = persistedResource.getDocumentId();
        Document persistedDocument = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(persistedDocument);

        Assertions.assertNotNull(persistedResource.getTeaserId());
        Long teaserId = persistedResource.getTeaserId();
        Block persistedTeaserBlock = client.blockRestEndPoint.getBlock(teaserId);
        Assertions.assertNotNull(persistedTeaserBlock);

        client.resourceRestEndpoint.deleteResource(resourceId);

        persistedResource = (Resource) client.resourceRestEndpoint.getAbstractResource(resourceId);
        Assertions.assertNull(persistedResource);

        persistedDocument = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNull(persistedDocument);

        persistedTeaserBlock = client.blockRestEndPoint.getBlock(teaserId);
        Assertions.assertNull(persistedTeaserBlock);
    }

    // *********************************************************************************************
    // Resource reference
    // *********************************************************************************************

    @Test
    public void testUpdateResourceReference() {
        // creation of the context : project, global card type, card type, card
        Project project = ColabFactory.createProject(client, "testResource");

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        Long globalCardTypeId = ColabFactory.createCardType(client, null).getId();

        Long cardId = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId)
            .getId();

        String url = "http://www.123soleil.chat/theGameEncyclopedia.pdf";

        ExternalLink doc = new ExternalLink();
        doc.setUrl(url);

        ResourceCreationBean resourceCreationBean = new ResourceCreationBean();
        resourceCreationBean.setAbstractCardTypeId(globalCardTypeId);
        resourceCreationBean.setDocument(doc);

        client.resourceRestEndpoint.createResource(resourceCreationBean);

        List<List<AbstractResource>> persistedCardResources = client.resourceRestEndpoint
            .getResourceChainForCard(cardId);
        Assertions.assertNotNull(persistedCardResources);
        Assertions.assertEquals(1, persistedCardResources.size());
        Assertions.assertTrue(persistedCardResources.get(0).size() > 1);
        Long resourceRefId = persistedCardResources.get(0).get(0).getId();

        AbstractResource persistedAbstractResourceRef = client.resourceRestEndpoint
            .getAbstractResource(resourceRefId);
        Assertions.assertNotNull(persistedAbstractResourceRef);
        Assertions.assertTrue(persistedAbstractResourceRef instanceof ResourceRef);

        ResourceRef persistedResourceRef = (ResourceRef) persistedAbstractResourceRef;
        Assertions.assertFalse(persistedResourceRef.isRefused());
        Assertions.assertNull(persistedResourceRef.getCategory());
        Assertions.assertEquals(cardId, persistedResourceRef.getCardId());

        String category = "category " + ((int) (Math.random() * 1000));

        persistedResourceRef.setRefused(true);
        persistedResourceRef.setCategory(category);

        client.resourceRestEndpoint.updateResourceRef(persistedResourceRef);

        persistedAbstractResourceRef = client.resourceRestEndpoint
            .getAbstractResource(resourceRefId);
        Assertions.assertNotNull(persistedAbstractResourceRef);
        Assertions.assertTrue(persistedAbstractResourceRef instanceof ResourceRef);

        persistedResourceRef = (ResourceRef) persistedAbstractResourceRef;
        Assertions.assertTrue(persistedResourceRef.isRefused());
        Assertions.assertEquals(category, persistedResourceRef.getCategory());
        Assertions.assertEquals(cardId, persistedResourceRef.getCardId());
    }

    // *********************************************************************************************
    // Category
    // *********************************************************************************************

    @Test
    public void testCategory() {
        Long projectId = ColabFactory
            .createProject(client, "test resources project #" + ((int) (Math.random() * 1000)))
            .getId();

        Long cardTypeId = ColabFactory.createCardType(client, projectId).getId();

        Resource persistedResource1 = createResourceForAbstractCardType(cardTypeId);
        Long resource1Id = persistedResource1.getId();
        Assertions.assertNull(persistedResource1.getCategory());

        Resource persistedResource2 = createResourceForAbstractCardType(cardTypeId);
        Long resource2Id = persistedResource2.getId();
        Assertions.assertNull(persistedResource2.getCategory());

        String categoryNameA = "Guides #" + ((int) (Math.random() * 1000));
        String categoryNameB = "Work files +\"*ç%&/()=?^±“#Ç[]|{}≠¿´<>,.-¨$"
            + ((int) (Math.random() * 1000));

        client.resourceRestEndpoint.setCategory(resource1Id, categoryNameA);
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertEquals(categoryNameA, persistedResource1.getCategory());
        Assertions.assertNull(persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategory(resource2Id, categoryNameA);
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertEquals(categoryNameA, persistedResource1.getCategory());
        Assertions.assertEquals(categoryNameA, persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategoryForList("   ",
            Lists.newArrayList(resource1Id, resource2Id));
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertNull(persistedResource1.getCategory());
        Assertions.assertNull(persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategoryForList(categoryNameA,
            Lists.newArrayList(resource1Id, resource2Id));
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertEquals(categoryNameA, persistedResource1.getCategory());
        Assertions.assertEquals(categoryNameA, persistedResource2.getCategory());

        client.resourceRestEndpoint
            .removeCategoryForList(Lists.newArrayList(resource1Id, resource2Id));
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertNull(persistedResource1.getCategory());
        Assertions.assertNull(persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategoryForList(categoryNameA,
            Lists.newArrayList(resource1Id, resource2Id));
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertEquals(categoryNameA, persistedResource1.getCategory());
        Assertions.assertEquals(categoryNameA, persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategory(resource1Id, categoryNameB);
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertEquals(categoryNameB, persistedResource1.getCategory());
        Assertions.assertEquals(categoryNameA, persistedResource2.getCategory());

        client.resourceRestEndpoint.removeCategory(resource1Id);
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertNull(persistedResource1.getCategory());
        Assertions.assertEquals(categoryNameA, persistedResource2.getCategory());
    }

    @Test
    public void testCategoryRenaming() {
        // context : a project with a card and a sub card
        Project project = ColabFactory.createProject(client,
            "testCategoryRenaming #" + ((int) (Math.random() * 1000)));
        Long projectId = project.getId();

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        Long cardType1Id = ColabFactory.createCardType(client, projectId).getId();

        Long card1Id = ColabFactory.createNewCard(client, rootCardContentId, cardType1Id).getId();

        Long cardContent1Id = ColabFactory.getCardContent(client, card1Id).getId();

        Long subCard2Id = ColabFactory.createNewCard(client, cardContent1Id, cardType1Id)
            .getId();

        Long subCardContent2Id = ColabFactory.getCardContent(client, subCard2Id).getId();

//        // another project with a card using a cardType of the previous project
//        Project projectII = ColabFactory.createProject(client,
//            "projectII #" + ((int) (Math.random() * 1000)));
//
//        Long rootCardContentIIId = ColabFactory.getRootContent(client, projectII).getId();
//
//        Long cardIIId = ColabFactory.createNewCard(client, rootCardContentIIId, cardType1Id)
//            .getId();

        // set and retrieve the resources / resources references
        Resource resourceOfCardType1 = createResourceForAbstractCardType(cardType1Id);
        Long resourceOfCardType1Id = resourceOfCardType1.getId();
        Assertions.assertNull(resourceOfCardType1.getCategory());

        ResourceRef resourceRefOfCard1 = retrieveResourceRefForCard(card1Id);
        Long resourceRefOfCard1Id = resourceRefOfCard1.getId();

        ResourceRef resourceRefOfCardContent1 = retrieveResourceRefForCardContent(
            cardContent1Id);
        Long resourceRefOfCardContent1Id = resourceRefOfCardContent1.getId();

        ResourceRef resourceRefOfSubCard2 = retrieveResourceRefForCard(subCard2Id);
        Long resourceRefOfSubCard2Id = resourceRefOfSubCard2.getId();

        ResourceRef resourceRefOfSubCardContent2 = retrieveResourceRefForCardContent(
            subCardContent2Id);
        Long resourceRefOfSubCardContent2Id = resourceRefOfSubCardContent2.getId();

//        ResourceRef resourceRefOfCardII = retrieveResourceRefForCard(cardIIId);
//        Long resourceRefOfCardIIId = resourceRefOfCardII.getId();

        Resource persistedResource3 = createResourceForAbstractCardType(cardType1Id);
        Long resource3Id = persistedResource3.getId();
        Assertions.assertNull(persistedResource3.getCategory());

        // play with the categories

        String categoryNameA = "Guides #" + ((int) (Math.random() * 1000));
        String categoryNameB = "Guidelines #" + ((int) (Math.random() * 1000));
        String categoryNameC = "Nice guidelines #" + ((int) (Math.random() * 1000));
        String categoryNameD = "Awesome guidelines #" + ((int) (Math.random() * 1000));
        String categoryNameE = "Valuable guidelines #" + ((int) (Math.random() * 1000));
//        String categoryNameF = "No interest guidelines #" + ((int) (Math.random() * 1000));

        String categoryNameO = "work files #" + ((int) (Math.random() * 1000));

        client.resourceRestEndpoint.setCategory(resource3Id, categoryNameO);
        persistedResource3 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource3Id);
        Assertions.assertEquals(categoryNameO, persistedResource3.getCategory());

        // set categoryNameA for each

        client.resourceRestEndpoint.setCategoryForList(categoryNameA,
            Lists.newArrayList(resourceOfCardType1Id,
                resourceRefOfCard1Id, resourceRefOfCardContent1Id,
                resourceRefOfSubCard2Id// ,
//                resourceRefOfCardIIId
            ));
        // no category for resourceRefOfSubCardContent2Id

        resourceOfCardType1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resourceOfCardType1Id);
        Assertions.assertEquals(categoryNameA, resourceOfCardType1.getCategory());
        resourceRefOfCard1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameA, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameA, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameA, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());
//        resourceRefOfCardII = client.resourceRestEndpoint.getAbstractResource(resourceRefOfCardIIId);
//        Assertions.assertEquals(categoryNameA, resourceRefOfCardII.getCategory());

        // rename category A -> B at card type level
        client.resourceRestEndpoint.renameCategoryForCardType(project.getId(), cardType1Id,
            categoryNameA, categoryNameB);

        resourceOfCardType1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resourceOfCardType1Id);
        Assertions.assertEquals(categoryNameB, resourceOfCardType1.getCategory());
        resourceRefOfCard1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameB, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameB, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameB, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());
        // in another project, stay category A
//        resourceRefOfCardII = client.resourceRestEndpoint.getAbstractResource(resourceRefOfCardIIId);
//        Assertions.assertEquals(categoryNameA, resourceRefOfCardII.getCategory());

        // rename category B -> C at card 1 level
        client.resourceRestEndpoint.renameCategoryForCard(card1Id, categoryNameB,
            categoryNameC);

        resourceOfCardType1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resourceOfCardType1Id);
        Assertions.assertEquals(categoryNameB, resourceOfCardType1.getCategory());
        resourceRefOfCard1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());

        // rename category C -> D at card content 1 level
        client.resourceRestEndpoint.renameCategoryForCardContent(cardContent1Id, categoryNameC,
            categoryNameD);

        resourceRefOfCard1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameD, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameD, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());

        // rename category D -> E at sub card 2 level
        client.resourceRestEndpoint.renameCategoryForCard(subCard2Id, categoryNameD,
            categoryNameE);

        resourceRefOfCardContent1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameD, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameE, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());

        // recapitulation at this point
//        resourceRefOfCardII = client.resourceRestEndpoint.getAbstractResource(resourceRefOfCardIIId);
//        Assertions.assertEquals(categoryNameA, resourceRefOfCardII.getCategory());
        resourceOfCardType1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resourceOfCardType1Id);
        Assertions.assertEquals(categoryNameB, resourceOfCardType1.getCategory());
        resourceRefOfCard1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameD, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameE, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());
        persistedResource3 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource3Id);
        Assertions.assertEquals(categoryNameO, persistedResource3.getCategory());

        // rename category A -> B at card type level
//        client.resourceRestEndpoint.renameCategoryForCardType(projectII.getId(), cardType1Id,
//            categoryNameA, categoryNameF);
//
//        resourceRefOfCardII = (ResourceRef) client.resourceRestEndpoint.getAbstractResource(resourceRefOfCardIIId);
//        Assertions.assertEquals(categoryNameF, resourceRefOfCardII.getCategory());
//        resourceOfCardType1 = (ResourceRef) client.resourceRestEndpoint.getAbstractResource(resourceOfCardType1Id);
//        Assertions.assertEquals(categoryNameB, resourceOfCardType1.getCategory());
//        resourceRefOfCard1 = (ResourceRef) client.resourceRestEndpoint.getAbstractResource(resourceRefOfCard1Id);
//        Assertions.assertEquals(categoryNameC, resourceRefOfCard1.getCategory());
//        resourceRefOfCardContent1 = (ResourceRef) client.resourceRestEndpoint
//            .getAbstractResource(resourceRefOfCardContent1Id);
//        Assertions.assertEquals(categoryNameD, resourceRefOfCardContent1.getCategory());
//        resourceRefOfSubCard2 = (ResourceRef) client.resourceRestEndpoint
//            .getAbstractResource(resourceRefOfSubCard2Id);
//        Assertions.assertEquals(categoryNameE, resourceRefOfSubCard2.getCategory());
//        resourceRefOfSubCardContent2 = (ResourceRef) client.resourceRestEndpoint
//            .getAbstractResource(resourceRefOfSubCardContent2Id);
//        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());
//        persistedResource3 = (ResourceRef) client.resourceRestEndpoint.getAbstractResource(resource3Id);
//        Assertions.assertEquals(categoryNameO, persistedResource3.getCategory());
    }

    // TODO check propagation with particular attention with multiple projects / sub card / card +
    // type + content consistency

    private Resource createResourceForAbstractCardType(Long cardTypeId) {
        String title = "All you need to know part #" + ((int) (Math.random() * 1000));
        String teaser = "and even more #" + ((int) (Math.random() * 1000));
        String url = "http://www.123soleil.chameau/Allyouneed.pdf";

        TextDataBlock teaserBlock = new TextDataBlock();
        teaserBlock.setMimeType("text/markdown");
        teaserBlock.setTextData(teaser);

        ExternalLink document = new ExternalLink();
        document.setUrl(url);

        ResourceCreationBean resourceCreationBean = new ResourceCreationBean();
        resourceCreationBean.setTitle(title);
        resourceCreationBean.setTeaser(teaserBlock);
        resourceCreationBean.setDocument(document);
        resourceCreationBean.setAbstractCardTypeId(cardTypeId);

        Long persistedResourceId = client.resourceRestEndpoint.createResource(resourceCreationBean);

        return (Resource) client.resourceRestEndpoint.getAbstractResource(persistedResourceId);
    }

    private ResourceRef retrieveResourceRefForCard(Long cardId) {
        return (ResourceRef) client.resourceRestEndpoint.getResourceChainForCard(cardId)
            .get(0).get(0);
    }

    private ResourceRef retrieveResourceRefForCardContent(Long cardContentId) {
        return (ResourceRef) client.resourceRestEndpoint
            .getResourceChainForCardContent(cardContentId).get(0).get(0);
    }

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
        Long rootCardContentResourceId = client.resourceRestEndpoint.createResource(rootCardContentResource);

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
        Long globalCardTypeResourceId = client.resourceRestEndpoint.createResource(globalCardTypeResource);

        Long card1Id = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId)
            .getId();
        ResourceCreationBean card1Resource = new ResourceCreationBean();
        card1Resource.setDocument(new BlockDocument());
        card1Resource.setCardId(card1Id);
        Long card1ResourceId = client.resourceRestEndpoint.createResource(card1Resource);

        Long card1TypeRefId = client.cardRestEndpoint.getCard(card1Id).getCardTypeId();
        ResourceCreationBean card1TypeRefResource = new ResourceCreationBean();
        card1TypeRefResource.setDocument(new BlockDocument());
        card1TypeRefResource.setAbstractCardTypeId(card1TypeRefId);
        Long card1TypeRefResourceId = client.resourceRestEndpoint.createResource(card1TypeRefResource);

        Long card1ContentId = ColabFactory.getCardContent(client, card1Id).getId();
        ResourceCreationBean card1ContentResource = new ResourceCreationBean();
        card1ContentResource.setDocument(new BlockDocument());
        card1ContentResource.setCardContentId(card1ContentId);
        Long card1ContentResourceId = client.resourceRestEndpoint.createResource(card1ContentResource);

        Long card2LocalTypeId = ColabFactory.createCardType(client, projectId).getId();
        ResourceCreationBean card2LocalTypeResource = new ResourceCreationBean();
        card2LocalTypeResource.setDocument(new BlockDocument());
        card2LocalTypeResource.setAbstractCardTypeId(card2LocalTypeId);
        Long card2LocalTypeResourceId = client.resourceRestEndpoint.createResource(card2LocalTypeResource);

        Long card2Id = ColabFactory.createNewCard(client, rootCardContentId, card2LocalTypeId).getId();
        ResourceCreationBean card2Resource = new ResourceCreationBean();
        card2Resource.setDocument(new BlockDocument());
        card2Resource.setCardId(card2Id);
        Long card2ResourceId = client.resourceRestEndpoint.createResource(card2Resource);

        Long card2ContentId = ColabFactory.getCardContent(client, card2Id).getId();
        ResourceCreationBean card2ContentResource = new ResourceCreationBean();
        card2ContentResource.setDocument(new BlockDocument());
        card2ContentResource.setCardContentId(card2ContentId);
        Long card2ContentResourceId = client.resourceRestEndpoint.createResource(card2ContentResource);

        // now add variants and cards and check that all resources are spread

        Long anotherGlobalCardTypeId = ColabFactory.createCardType(client, null).getId();
        ResourceCreationBean anotherGlobalCardTypeResource = new ResourceCreationBean();
        anotherGlobalCardTypeResource.setDocument(new BlockDocument());
        anotherGlobalCardTypeResource.setAbstractCardTypeId(anotherGlobalCardTypeId);
        Long anotherGlobalCardTypeResourceId = client.resourceRestEndpoint.createResource(anotherGlobalCardTypeResource);

        Long anotherLocalCardTypeId = ColabFactory.createCardType(client, projectId).getId();
        ResourceCreationBean anotherLocalCardTypeResource = new ResourceCreationBean();
        anotherLocalCardTypeResource.setDocument(new BlockDocument());
        anotherLocalCardTypeResource.setAbstractCardTypeId(anotherLocalCardTypeId);
        Long anotherLocalCardTypeResourceId = client.resourceRestEndpoint.createResource(anotherLocalCardTypeResource);

        List<List<AbstractResource>> persistedResourcesAndRefs;
        List<Long> actual;

        Long newVariant1Id = ColabFactory.createNewCardContent(client, card1Id).getId();
        persistedResourcesAndRefs = client.resourceRestEndpoint.getResourceChainForCardContent(newVariant1Id);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId()).collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(globalCardTypeResourceId));
        Assertions.assertTrue(actual.contains(card1TypeRefResourceId));
        Assertions.assertTrue(actual.contains(card1ResourceId));
        Assertions.assertEquals(5,  actual.size());

        Long newCard1gId = ColabFactory.createNewCard(client, card1ContentId, anotherGlobalCardTypeId).getId();
        Long newCard1gContentId = ColabFactory.getCardContent(client, newCard1gId).getId();
        persistedResourcesAndRefs = client.resourceRestEndpoint.getResourceChainForCardContent(newCard1gContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId()).collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card1ResourceId));
        Assertions.assertTrue(actual.contains(card1ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherGlobalCardTypeResourceId));
        Assertions.assertEquals(5,  actual.size());

        Long newCard1lId = ColabFactory.createNewCard(client, card1ContentId, anotherLocalCardTypeId).getId();
        Long newCard1lContentId = ColabFactory.getCardContent(client, newCard1lId).getId();
        persistedResourcesAndRefs = client.resourceRestEndpoint.getResourceChainForCardContent(newCard1lContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId()).collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card1ResourceId));
        Assertions.assertTrue(actual.contains(card1ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherLocalCardTypeResourceId));
        Assertions.assertEquals(5,  actual.size());

        Long newVariant2Id = ColabFactory.createNewCardContent(client, card2Id).getId();
        persistedResourcesAndRefs = client.resourceRestEndpoint.getResourceChainForCardContent(newVariant2Id);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId()).collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card2LocalTypeResourceId));
        Assertions.assertTrue(actual.contains(card2ResourceId));
        Assertions.assertEquals(4,  actual.size());

        Long newCard2gId = ColabFactory.createNewCard(client, card2ContentId, anotherGlobalCardTypeId).getId();
        Long newCard2gContentId = ColabFactory.getCardContent(client, newCard2gId).getId();
        persistedResourcesAndRefs = client.resourceRestEndpoint.getResourceChainForCardContent(newCard2gContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId()).collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card2ResourceId));
        Assertions.assertTrue(actual.contains(card2ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherGlobalCardTypeResourceId));
        Assertions.assertEquals(5,  actual.size());

        Long newCard2lId = ColabFactory.createNewCard(client, card2ContentId, anotherLocalCardTypeId).getId();
        Long newCard2lContentId = ColabFactory.getCardContent(client, newCard2lId).getId();
        persistedResourcesAndRefs = client.resourceRestEndpoint.getResourceChainForCardContent(newCard2lContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId()).collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card2ResourceId));
        Assertions.assertTrue(actual.contains(card2ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherLocalCardTypeResourceId));
        Assertions.assertEquals(5,  actual.size());
    }

    // a similar test but creating the resources after everything else is made in {@link ResourceAndReferenceTest}


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

        Long card1TypeRefId = client.cardRestEndpoint.getCard(card1Id).getCardTypeId();

        Long card1ContentId = ColabFactory.getCardContent(client, card1Id).getId();

        Long card2LocalTypeId = ColabFactory.createCardType(client, projectId).getId();

        Long card2Id = ColabFactory.createNewCard(client, rootCardContentId, card2LocalTypeId).getId();

        Long card2ContentId = ColabFactory.getCardContent(client, card2Id).getId();

        Long anotherGlobalCardTypeId = ColabFactory.createCardType(client, null).getId();

        Long anotherLocalCardTypeId = ColabFactory.createCardType(client, projectId).getId();

        Long newVariant1Id = ColabFactory.createNewCardContent(client, card1Id).getId();

        Long newCard1gId = ColabFactory.createNewCard(client, card1ContentId, anotherGlobalCardTypeId).getId();
        Long newCard1gContentId = ColabFactory.getCardContent(client, newCard1gId).getId();

        Long newCard1lId = ColabFactory.createNewCard(client, card1ContentId, anotherLocalCardTypeId).getId();
        Long newCard1lContentId = ColabFactory.getCardContent(client, newCard1lId).getId();

        Long newVariant2Id = ColabFactory.createNewCardContent(client, card2Id).getId();

        Long newCard2gId = ColabFactory.createNewCard(client, card2ContentId, anotherGlobalCardTypeId).getId();
        Long newCard2gContentId = ColabFactory.getCardContent(client, newCard2gId).getId();

        Long newCard2lId = ColabFactory.createNewCard(client, card2ContentId, anotherLocalCardTypeId).getId();
        Long newCard2lContentId = ColabFactory.getCardContent(client, newCard2lId).getId();

        // now add resources
        ResourceCreationBean rootCardResource = new ResourceCreationBean();
        rootCardResource.setDocument(new BlockDocument());
        rootCardResource.setCardId(rootCardId);
        Long rootCardResourceId = client.resourceRestEndpoint.createResource(rootCardResource);

        ResourceCreationBean rootCardContentResource = new ResourceCreationBean();
        rootCardContentResource.setDocument(new BlockDocument());
        rootCardContentResource.setCardContentId(rootCardContentId);
        Long rootCardContentResourceId = client.resourceRestEndpoint.createResource(rootCardContentResource);

        ResourceCreationBean rootCardVariantResource = new ResourceCreationBean();
        rootCardVariantResource.setDocument(new BlockDocument());
        rootCardVariantResource.setCardContentId(rootCardVariantId);
        client.resourceRestEndpoint.createResource(rootCardVariantResource);

        ResourceCreationBean globalCardTypeResource = new ResourceCreationBean();
        globalCardTypeResource.setDocument(new BlockDocument());
        globalCardTypeResource.setAbstractCardTypeId(globalCardTypeId);
        Long globalCardTypeResourceId = client.resourceRestEndpoint.createResource(globalCardTypeResource);

        ResourceCreationBean card1Resource = new ResourceCreationBean();
        card1Resource.setDocument(new BlockDocument());
        card1Resource.setCardId(card1Id);
        Long card1ResourceId = client.resourceRestEndpoint.createResource(card1Resource);

        ResourceCreationBean card1TypeRefResource = new ResourceCreationBean();
        card1TypeRefResource.setDocument(new BlockDocument());
        card1TypeRefResource.setAbstractCardTypeId(card1TypeRefId);
        Long card1TypeRefResourceId = client.resourceRestEndpoint.createResource(card1TypeRefResource);

        ResourceCreationBean card1ContentResource = new ResourceCreationBean();
        card1ContentResource.setDocument(new BlockDocument());
        card1ContentResource.setCardContentId(card1ContentId);
        Long card1ContentResourceId = client.resourceRestEndpoint.createResource(card1ContentResource);

        ResourceCreationBean card2LocalTypeResource = new ResourceCreationBean();
        card2LocalTypeResource.setDocument(new BlockDocument());
        card2LocalTypeResource.setAbstractCardTypeId(card2LocalTypeId);
        Long card2LocalTypeResourceId = client.resourceRestEndpoint.createResource(card2LocalTypeResource);

        ResourceCreationBean card2Resource = new ResourceCreationBean();
        card2Resource.setDocument(new BlockDocument());
        card2Resource.setCardId(card2Id);
        Long card2ResourceId = client.resourceRestEndpoint.createResource(card2Resource);

        ResourceCreationBean card2ContentResource = new ResourceCreationBean();
        card2ContentResource.setDocument(new BlockDocument());
        card2ContentResource.setCardContentId(card2ContentId);
        Long card2ContentResourceId = client.resourceRestEndpoint.createResource(card2ContentResource);

        ResourceCreationBean anotherGlobalCardTypeResource = new ResourceCreationBean();
        anotherGlobalCardTypeResource.setDocument(new BlockDocument());
        anotherGlobalCardTypeResource.setAbstractCardTypeId(anotherGlobalCardTypeId);
        Long anotherGlobalCardTypeResourceId = client.resourceRestEndpoint.createResource(anotherGlobalCardTypeResource);

        ResourceCreationBean anotherLocalCardTypeResource = new ResourceCreationBean();
        anotherLocalCardTypeResource.setDocument(new BlockDocument());
        anotherLocalCardTypeResource.setAbstractCardTypeId(anotherLocalCardTypeId);
        Long anotherLocalCardTypeResourceId = client.resourceRestEndpoint.createResource(anotherLocalCardTypeResource);

        // now see how the resources are spread
        List<List<AbstractResource>> persistedResourcesAndRefs;
        List<Long> actual;
        persistedResourcesAndRefs = client.resourceRestEndpoint.getResourceChainForCardContent(newVariant1Id);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId()).collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(globalCardTypeResourceId));
        Assertions.assertTrue(actual.contains(card1TypeRefResourceId));
        Assertions.assertTrue(actual.contains(card1ResourceId));
        Assertions.assertEquals(5,  actual.size());

        persistedResourcesAndRefs = client.resourceRestEndpoint.getResourceChainForCardContent(newCard1gContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId()).collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card1ResourceId));
        Assertions.assertTrue(actual.contains(card1ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherGlobalCardTypeResourceId));
        Assertions.assertEquals(5,  actual.size());

        persistedResourcesAndRefs = client.resourceRestEndpoint.getResourceChainForCardContent(newCard1lContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId()).collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card1ResourceId));
        Assertions.assertTrue(actual.contains(card1ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherLocalCardTypeResourceId));
        Assertions.assertEquals(5,  actual.size());

        persistedResourcesAndRefs = client.resourceRestEndpoint.getResourceChainForCardContent(newVariant2Id);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId()).collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card2LocalTypeResourceId));
        Assertions.assertTrue(actual.contains(card2ResourceId));
        Assertions.assertEquals(4,  actual.size());

        persistedResourcesAndRefs = client.resourceRestEndpoint.getResourceChainForCardContent(newCard2gContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId()).collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card2ResourceId));
        Assertions.assertTrue(actual.contains(card2ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherGlobalCardTypeResourceId));
        Assertions.assertEquals(5,  actual.size());

        persistedResourcesAndRefs = client.resourceRestEndpoint.getResourceChainForCardContent(newCard2lContentId);
        actual = persistedResourcesAndRefs.stream().map(list -> list.get(list.size() - 1).getId()).collect(Collectors.toList());
        Assertions.assertTrue(actual.contains(rootCardResourceId));
        Assertions.assertTrue(actual.contains(rootCardContentResourceId));
        Assertions.assertTrue(actual.contains(card2ResourceId));
        Assertions.assertTrue(actual.contains(card2ContentResourceId));
        Assertions.assertTrue(actual.contains(anotherLocalCardTypeResourceId));
        Assertions.assertEquals(5,  actual.size());
    }

}
