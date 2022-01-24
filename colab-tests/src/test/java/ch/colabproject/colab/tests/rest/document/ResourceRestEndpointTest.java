/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.ExternalLink;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.rest.document.bean.ResourceCreationBean;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import java.util.List;
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
        Long globalCardTypeId = ColabFactory.createGlobalCardType(client).getId();

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
        resourceCreationBean.setDocuments(List.of(doc));
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

        List<Document> persistedDocs = client.resourceRestEndpoint.getDocumentsOfResource(resourceId);
        Assertions.assertNotNull(persistedDocs);
        Assertions.assertEquals(1, persistedDocs.size());
        Document persistedDocument = persistedDocs.get(0);
        Assertions.assertNotNull(persistedDocument);
        Assertions.assertEquals(resourceId, persistedDocument.getOwningResourceId());
        Assertions.assertNull(persistedDocument.getOwningCardContentId());
        Assertions.assertTrue(persistedDocument instanceof ExternalLink);
        ExternalLink persistedExtDoc = (ExternalLink) persistedDocument;
        Assertions.assertEquals(url, persistedExtDoc.getUrl());

        Assertions.assertNotNull(persistedResource.getTeaserId());
        Block persistedTeaserBlock = client.blockRestEndpoint
            .getBlock(persistedResource.getTeaserId());
        Assertions.assertNotNull(persistedTeaserBlock);
        Assertions.assertEquals(persistedResource.getTeaserId(), persistedTeaserBlock.getId());
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
        Long globalCardTypeId = ColabFactory.createGlobalCardType(client).getId();

        String url = "http://www.123soleil.chat/theGameEncyclopedia.pdf";

        ExternalLink doc = new ExternalLink();
        doc.setUrl(url);

        ResourceCreationBean resourceCreationBean = new ResourceCreationBean();
        resourceCreationBean.setAbstractCardTypeId(globalCardTypeId);
        resourceCreationBean.setDocuments(List.of(doc));

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

        List<Document> persistedDocs = client.resourceRestEndpoint.getDocumentsOfResource(resourceId);
        Assertions.assertNotNull(persistedDocs);
        Assertions.assertEquals(1, persistedDocs.size());
        Document persistedDocument = persistedDocs.get(0);
        Assertions.assertNotNull(persistedDocument);
        Assertions.assertEquals(resourceId, persistedDocument.getOwningResourceId());
        Assertions.assertNull(persistedDocument.getOwningCardContentId());
        Assertions.assertTrue(persistedDocument instanceof ExternalLink);
        ExternalLink persistedExtDoc = (ExternalLink) persistedDocument;
        Assertions.assertEquals(url, persistedExtDoc.getUrl());

        Assertions.assertNotNull(persistedResource.getTeaserId());
        Block persistedTeaserBlock = client.blockRestEndpoint
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

        persistedDocs = client.resourceRestEndpoint.getDocumentsOfResource(resourceId);
        Assertions.assertNotNull(persistedDocs);
        Assertions.assertEquals(1, persistedDocs.size());
        persistedDocument = persistedDocs.get(0);
        Assertions.assertNotNull(persistedDocument);
        Assertions.assertEquals(resourceId, persistedDocument.getOwningResourceId());
        Assertions.assertNull(persistedDocument.getOwningCardContentId());
        Assertions.assertTrue(persistedDocument instanceof ExternalLink);
        persistedExtDoc = (ExternalLink) persistedDocument;
        Assertions.assertEquals(url, persistedExtDoc.getUrl());

        Assertions.assertNotNull(persistedResource.getTeaserId());
        persistedTeaserBlock = client.blockRestEndpoint.getBlock(persistedResource.getTeaserId());
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
        Long globalCardTypeId = ColabFactory.createGlobalCardType(client).getId();

        String url = "http://www.123soleil.chat/theGameEncyclopedia.pdf";

        ExternalLink doc = new ExternalLink();
        doc.setUrl(url);

        ResourceCreationBean resourceCreationBean = new ResourceCreationBean();
        resourceCreationBean.setAbstractCardTypeId(globalCardTypeId);
        resourceCreationBean.setDocuments(List.of(doc));

        Long resourceId = client.resourceRestEndpoint.createResource(resourceCreationBean);

        Resource persistedResource = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resourceId);
        Assertions.assertNotNull(persistedResource);

        List<Document> persistedDocs = client.resourceRestEndpoint.getDocumentsOfResource(resourceId);
        Assertions.assertNotNull(persistedDocs);
        Assertions.assertEquals(1, persistedDocs.size());
        Document persistedDocument = persistedDocs.get(0);
        Assertions.assertNotNull(persistedDocument);
        Long documentId = persistedDocument.getId();

        Assertions.assertNotNull(persistedResource.getTeaserId());
        Long teaserId = persistedResource.getTeaserId();
        Block persistedTeaserBlock = client.blockRestEndpoint.getBlock(teaserId);
        Assertions.assertNotNull(persistedTeaserBlock);

        client.resourceRestEndpoint.deleteResource(resourceId);

        persistedResource = (Resource) client.resourceRestEndpoint.getAbstractResource(resourceId);
        Assertions.assertNull(persistedResource);

        persistedDocument = client.documentRestEndpoint.getDocument(documentId);
        Assertions.assertNull(persistedDocument);

        persistedTeaserBlock = client.blockRestEndpoint.getBlock(teaserId);
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

        Long globalCardTypeId = ColabFactory.createGlobalCardType(client).getId();

        Long cardId = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId)
            .getId();

        String url = "http://www.123soleil.chat/theGameEncyclopedia.pdf";

        ExternalLink doc = new ExternalLink();
        doc.setUrl(url);

        ResourceCreationBean resourceCreationBean = new ResourceCreationBean();
        resourceCreationBean.setAbstractCardTypeId(globalCardTypeId);
        resourceCreationBean.setDocuments(List.of(doc));

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

}
