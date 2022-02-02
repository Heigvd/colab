/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.DocumentFile;
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

    private static final String DEFAULT_MIME_TYPE = "text/markdown";

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

        TextDataBlock teaserBlock = new TextDataBlock();
        teaserBlock.setMimeType(DEFAULT_MIME_TYPE);
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

        List<Document> persistedDocs = client.resourceRestEndpoint
            .getDocumentsOfResource(resourceId);
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
        TextDataBlock persistedTeaserBlock = client.blockRestEndpoint
            .getBlock(persistedResource.getTeaserId());
        Assertions.assertNotNull(persistedTeaserBlock);
        Assertions.assertEquals(persistedResource.getTeaserId(), persistedTeaserBlock.getId());
        Assertions.assertEquals(DEFAULT_MIME_TYPE, persistedTeaserBlock.getMimeType());
        Assertions.assertEquals(teaser, persistedTeaserBlock.getTextData());
        Assertions.assertNull(persistedTeaserBlock.getOwningCardContentId());
        Assertions.assertNull(persistedTeaserBlock.getOwningResourceId());
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

        List<Document> persistedDocs = client.resourceRestEndpoint
            .getDocumentsOfResource(resourceId);
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
        TextDataBlock persistedTeaserBlock = client.blockRestEndpoint
            .getBlock(persistedResource.getTeaserId());
        Assertions.assertNotNull(persistedTeaserBlock);
        Assertions.assertEquals(DEFAULT_MIME_TYPE, persistedTeaserBlock.getMimeType());
        Assertions.assertNull(persistedTeaserBlock.getTextData());
        Assertions.assertNull(persistedTeaserBlock.getOwningCardContentId());
        Assertions.assertNull(persistedTeaserBlock.getOwningResourceId());

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
        Assertions.assertEquals(DEFAULT_MIME_TYPE, persistedTeaserBlock.getMimeType());
        Assertions.assertNull(persistedTeaserBlock.getTextData());
        Assertions.assertNull(persistedTeaserBlock.getOwningCardContentId());
        Assertions.assertNull(persistedTeaserBlock.getOwningResourceId());
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

        List<Document> persistedDocs = client.resourceRestEndpoint
            .getDocumentsOfResource(resourceId);
        Assertions.assertNotNull(persistedDocs);
        Assertions.assertEquals(1, persistedDocs.size());
        Document persistedDocument = persistedDocs.get(0);
        Assertions.assertNotNull(persistedDocument);
        Long documentId = persistedDocument.getId();

        Assertions.assertNotNull(persistedResource.getTeaserId());
        Long teaserId = persistedResource.getTeaserId();
        TextDataBlock persistedTeaserBlock = client.blockRestEndpoint.getBlock(teaserId);
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
    // Resource documents
    // *********************************************************************************************

    @Test
    public void testDocumentsAccess() {
        // creation of the context : global card type
        Long globalCardTypeId = ColabFactory.createGlobalCardType(client).getId();

        // create a resource with a document

        String doc1Url = "littleTurtle";
        ExternalLink doc1 = new ExternalLink();
        doc1.setUrl(doc1Url);

        String doc2TextData = "obligar";
        TextDataBlock doc2 = new TextDataBlock();
        doc2.setTextData(doc2TextData);

        ResourceCreationBean resourceCreationBean = new ResourceCreationBean();
        resourceCreationBean.setAbstractCardTypeId(globalCardTypeId);
        resourceCreationBean.setDocuments(List.of(doc1, doc2));

        Long resourceId = client.resourceRestEndpoint.createResource(resourceCreationBean);

        Resource persistedResource = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resourceId);
        Assertions.assertNotNull(persistedResource);

        List<Document> persistedDocs = client.resourceRestEndpoint
            .getDocumentsOfResource(resourceId);
        Assertions.assertNotNull(persistedDocs);
        Assertions.assertEquals(2, persistedDocs.size());
        Document persistedDoc1;
        Document persistedDoc2;
        if (persistedDocs.get(0) instanceof ExternalLink) {
            persistedDoc1 = persistedDocs.get(0);
            persistedDoc2 = persistedDocs.get(1);
        } else {
            persistedDoc1 = persistedDocs.get(1);
            persistedDoc2 = persistedDocs.get(0);
        }
        Long doc1Id = persistedDoc1.getId();
        Assertions.assertNotNull(persistedDoc1);
        Assertions.assertNotNull(persistedDoc1.getId());
        Assertions.assertEquals(0, persistedDoc1.getIndex());
        Assertions.assertEquals(resourceId, persistedDoc1.getOwningResourceId());
        Assertions.assertTrue(persistedDoc1 instanceof ExternalLink);
        Assertions.assertEquals(doc1Url, ((ExternalLink) persistedDoc1).getUrl());
        Long doc2Id = persistedDoc2.getId();
        Assertions.assertNotNull(persistedDoc2);
        Assertions.assertNotNull(persistedDoc2.getId());
        Assertions.assertEquals(1000, persistedDoc2.getIndex());
        Assertions.assertEquals(resourceId, persistedDoc2.getOwningResourceId());
        Assertions.assertTrue(persistedDoc2 instanceof TextDataBlock);
        Assertions.assertEquals(doc2TextData, ((TextDataBlock) persistedDoc2).getTextData());

        Document persistedDocument1 = client.documentRestEndpoint.getDocument(doc1Id);
        Assertions.assertEquals(persistedDoc1, persistedDocument1);

        Document persistedDocument2 = client.documentRestEndpoint.getDocument(doc2Id);
        Assertions.assertEquals(persistedDoc2, persistedDocument2);

        // remove document

        client.resourceRestEndpoint.removeDocument(resourceId, doc1Id);

        persistedDocs = client.resourceRestEndpoint.getDocumentsOfResource(resourceId);
        Assertions.assertNotNull(persistedDocs);
        Assertions.assertEquals(1, persistedDocs.size());
        persistedDoc2 = persistedDocs.get(0);
        Assertions.assertNotNull(persistedDoc2);
        Assertions.assertNotNull(persistedDoc2.getId());
        Assertions.assertEquals(1000, persistedDoc2.getIndex());
        Assertions.assertEquals(resourceId, persistedDoc2.getOwningResourceId());
        Assertions.assertTrue(persistedDoc2 instanceof TextDataBlock);
        Assertions.assertEquals(doc2TextData, ((TextDataBlock) persistedDoc2).getTextData());

        persistedDocument1 = client.documentRestEndpoint.getDocument(doc1Id);
        Assertions.assertNull(persistedDocument1);

        persistedDocument2 = client.documentRestEndpoint.getDocument(doc2Id);
        Assertions.assertEquals(persistedDoc2, persistedDocument2);

        // remove document

        client.resourceRestEndpoint.removeDocument(resourceId, doc2Id);

        persistedDocument1 = client.documentRestEndpoint.getDocument(doc1Id);
        Assertions.assertNull(persistedDocument1);

        persistedDocument2 = client.documentRestEndpoint.getDocument(doc2Id);
        Assertions.assertNull(persistedDocument2);

        // set new document
        String doc3FileName = "shabipoo";
        DocumentFile doc3 = new DocumentFile();
        doc3.setFileName(doc3FileName);

        Document createdDoc3 = client.resourceRestEndpoint.addDocument(resourceId, doc3);
        Long doc3Id = persistedDoc2.getId();
        Assertions.assertNotNull(createdDoc3);
        Assertions.assertNotNull(createdDoc3.getId());
        Assertions.assertEquals(0, createdDoc3.getIndex());
        Assertions.assertEquals(resourceId, createdDoc3.getOwningResourceId());
        Assertions.assertTrue(createdDoc3 instanceof DocumentFile);
        Assertions.assertEquals(doc3FileName, ((DocumentFile) createdDoc3).getFileName());

        persistedDocs = client.resourceRestEndpoint.getDocumentsOfResource(resourceId);
        Assertions.assertNotNull(persistedDocs);
        Assertions.assertEquals(1, persistedDocs.size());
        Assertions.assertEquals(createdDoc3, persistedDocs.get(0));

        // delete resource

        client.resourceRestEndpoint.deleteResource(resourceId);

        persistedDocument1 = client.documentRestEndpoint.getDocument(doc1Id);
        Assertions.assertNull(persistedDocument1);

        persistedDocument2 = client.documentRestEndpoint.getDocument(doc2Id);
        Assertions.assertNull(persistedDocument2);

        Document persistedDocument3 = client.documentRestEndpoint.getDocument(doc3Id);
        Assertions.assertNull(persistedDocument3);
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
