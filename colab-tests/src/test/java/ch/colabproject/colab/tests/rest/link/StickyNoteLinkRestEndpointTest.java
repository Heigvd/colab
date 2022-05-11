/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.link;

import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.rest.link.bean.StickyNoteLinkCreationData;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of sticky note link rest end point from a client point of view
 *
 * @author sandra
 */
public class StickyNoteLinkRestEndpointTest extends AbstractArquillianTest {

    private static final String DEFAULT_MIME_TYPE = "text/markdown";

    @Test
    public void testCreateStickyNoteLinkSrcCard() {
        String teaser = "remember me #" + ((int) (Math.random() * 1000));
        String explanation = "This resource explains exactly how to do a nice report #"
            + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client, "testCreateStickyNoteLinkSrcCard");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        TextDataBlock explanationBlock = new TextDataBlock();
        explanationBlock.setMimeType(DEFAULT_MIME_TYPE);
        explanationBlock.setTextData(explanation);

        StickyNoteLinkCreationData linkToCreate = new StickyNoteLinkCreationData();
        linkToCreate.setSrcCardId(cardId);
        linkToCreate.setDestinationCardId(workCardId);
        linkToCreate.setTeaser(teaser);
        linkToCreate.setExplanation(explanationBlock);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(linkToCreate);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(cardId, persistedLink.getSrcCardId());
        Assertions.assertEquals(workCardId, persistedLink.getDestinationCardId());
        Assertions.assertEquals(teaser, persistedLink.getTeaser());

        Assertions.assertNotNull(persistedLink.getExplanationId());
        TextDataBlock persistedExplanationBlock = (TextDataBlock) client.documentRestEndpoint
            .getDocument(persistedLink.getExplanationId());
        Assertions.assertNotNull(persistedExplanationBlock);
        Assertions.assertEquals(DEFAULT_MIME_TYPE, persistedExplanationBlock.getMimeType());
        Assertions.assertEquals(explanation, persistedExplanationBlock.getTextData());
        Assertions.assertNull(persistedExplanationBlock.getOwningCardContentId());
        Assertions.assertNull(persistedExplanationBlock.getOwningResourceId());

        List<StickyNoteLink> workCardLinks = client.cardRestEndpoint
            .getStickyNoteLinksAsDest(workCardId);
        Assertions.assertNotNull(workCardLinks);
        Assertions.assertEquals(1, workCardLinks.size());
        Assertions.assertEquals(linkId, workCardLinks.get(0).getId());

        List<StickyNoteLink> cardLinks = client.cardRestEndpoint.getStickyNoteLinksAsSrc(cardId);
        Assertions.assertNotNull(cardLinks);
        Assertions.assertEquals(1, cardLinks.size());
        Assertions.assertEquals(linkId, cardLinks.get(0).getId());
    }

    @Test
    public void testCreateStickyNoteLinkSrcCardContent() {
        String teaser = "remember me #" + ((int) (Math.random() * 1000));
        String explanation = "This resource explains exactly how to do a nice report #"
            + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client,
            "testCreateStickyNoteLinkSrcCardContent");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long cardContentId = ColabFactory.getCardContent(client, cardId).getId();

        TextDataBlock explanationBlock = new TextDataBlock();
        explanationBlock.setMimeType(DEFAULT_MIME_TYPE);
        explanationBlock.setTextData(explanation);

        StickyNoteLinkCreationData linkToCreate = new StickyNoteLinkCreationData();
        linkToCreate.setSrcCardContentId(cardContentId);
        linkToCreate.setDestinationCardId(workCardId);
        linkToCreate.setTeaser(teaser);
        linkToCreate.setExplanation(explanationBlock);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(linkToCreate);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(cardContentId, persistedLink.getSrcCardContentId());
        Assertions.assertEquals(workCardId, persistedLink.getDestinationCardId());
        Assertions.assertEquals(teaser, persistedLink.getTeaser());

        Assertions.assertNotNull(persistedLink.getExplanationId());
        TextDataBlock persistedExplanationBlock = (TextDataBlock) client.documentRestEndpoint
            .getDocument(persistedLink.getExplanationId());
        Assertions.assertNotNull(persistedExplanationBlock);
        Assertions.assertEquals(DEFAULT_MIME_TYPE, persistedExplanationBlock.getMimeType());
        Assertions.assertEquals(explanation, persistedExplanationBlock.getTextData());
        Assertions.assertNull(persistedExplanationBlock.getOwningCardContentId());
        Assertions.assertNull(persistedExplanationBlock.getOwningResourceId());

        List<StickyNoteLink> cardContentLinks = client.cardContentRestEndpoint
            .getStickyNoteLinksAsSrc(cardContentId);
        Assertions.assertNotNull(cardContentLinks);
        Assertions.assertEquals(1, cardContentLinks.size());
        Assertions.assertEquals(linkId, cardContentLinks.get(0).getId());
    }

    @Test
    public void testCreateStickyNoteLinkSrcResource() {
        String teaser = "remember me #" + ((int) (Math.random() * 1000));
        String explanation = "This resource explains exactly how to do a nice report #"
            + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client,
            "testCreateStickyNoteLinkSrcResource");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long resourceId = ColabFactory.createCardResource(client, cardId, "soft cakes").getId();

        TextDataBlock explanationBlock = new TextDataBlock();
        explanationBlock.setMimeType(DEFAULT_MIME_TYPE);
        explanationBlock.setTextData(explanation);

        StickyNoteLinkCreationData linkToCreate = new StickyNoteLinkCreationData();
        linkToCreate.setSrcResourceOrRefId(resourceId);
        linkToCreate.setDestinationCardId(workCardId);
        linkToCreate.setTeaser(teaser);
        linkToCreate.setExplanation(explanationBlock);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(linkToCreate);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(resourceId, persistedLink.getSrcResourceOrRefId());
        Assertions.assertEquals(workCardId, persistedLink.getDestinationCardId());
        Assertions.assertEquals(teaser, persistedLink.getTeaser());

        Assertions.assertNotNull(persistedLink.getExplanationId());
        TextDataBlock persistedExplanationBlock = (TextDataBlock) client.documentRestEndpoint
            .getDocument(persistedLink.getExplanationId());
        Assertions.assertNotNull(persistedExplanationBlock);
        Assertions.assertEquals(DEFAULT_MIME_TYPE, persistedExplanationBlock.getMimeType());
        Assertions.assertEquals(explanation, persistedExplanationBlock.getTextData());
        Assertions.assertNull(persistedExplanationBlock.getOwningCardContentId());
        Assertions.assertNull(persistedExplanationBlock.getOwningResourceId());

        List<StickyNoteLink> resourceLinks = client.resourceRestEndpoint
            .getStickyNoteLinksAsSrc(resourceId);
        Assertions.assertNotNull(resourceLinks);
        Assertions.assertEquals(1, resourceLinks.size());
        Assertions.assertEquals(linkId, resourceLinks.get(0).getId());
    }

    @Test
    public void testCreateStickyNoteLinkSrcResourceReference() {
        String teaser = "remember me #" + ((int) (Math.random() * 1000));
        String explanation = "This resource explains exactly how to do a nice report #"
            + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client,
            "testCreateStickyNoteLinkSrcResourceReference");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long cardContentId = ColabFactory.getCardContent(client, cardId).getId();

        ColabFactory.createCardResource(client, cardId, "soft cakes").getId();

        List<AbstractResource> resourceRefs = client.resourceRestEndpoint
            .getResourceChainForCardContent(cardContentId).get(0);
        Long resourceRefId = resourceRefs.get(0).getId();

        TextDataBlock explanationBlock = new TextDataBlock();
        explanationBlock.setMimeType(DEFAULT_MIME_TYPE);
        explanationBlock.setTextData(explanation);

        StickyNoteLinkCreationData linkToCreate = new StickyNoteLinkCreationData();
        linkToCreate.setSrcResourceOrRefId(resourceRefId);
        linkToCreate.setDestinationCardId(workCardId);
        linkToCreate.setTeaser(teaser);
        linkToCreate.setExplanation(explanationBlock);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(linkToCreate);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(resourceRefId, persistedLink.getSrcResourceOrRefId());
        Assertions.assertEquals(workCardId, persistedLink.getDestinationCardId());
        Assertions.assertEquals(teaser, persistedLink.getTeaser());

        Assertions.assertNotNull(persistedLink.getExplanationId());
        TextDataBlock persistedExplanationBlock = (TextDataBlock) client.documentRestEndpoint
            .getDocument(persistedLink.getExplanationId());
        Assertions.assertNotNull(persistedExplanationBlock);
        Assertions.assertEquals(DEFAULT_MIME_TYPE, persistedExplanationBlock.getMimeType());
        Assertions.assertEquals(explanation, persistedExplanationBlock.getTextData());
        Assertions.assertNull(persistedExplanationBlock.getOwningCardContentId());
        Assertions.assertNull(persistedExplanationBlock.getOwningResourceId());

        List<StickyNoteLink> resourceLinks = client.resourceRestEndpoint
            .getStickyNoteLinksAsSrc(resourceRefId);
        Assertions.assertNotNull(resourceLinks);
        Assertions.assertEquals(1, resourceLinks.size());
        Assertions.assertEquals(linkId, resourceLinks.get(0).getId());
    }

    @Test
    public void testCreateStickyNoteLinkSrcTextDataBlock() {
        String teaser = "remember me #" + ((int) (Math.random() * 1000));
        String explanation = "This resource explains exactly how to do a nice report #"
            + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client, "testCreateStickyNoteLinkSrcBlock");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long resourceId = ColabFactory.createTextDataBlockCardResource(client, cardId, "soft cakes")
            .getId();

        List<Document> docs = client.resourceRestEndpoint.getDocumentsOfResource(resourceId);
        TextDataBlock document = (TextDataBlock) docs.get(0);
        Long docId = document.getId();

        TextDataBlock explanationBlock = new TextDataBlock();
        explanationBlock.setMimeType(DEFAULT_MIME_TYPE);
        explanationBlock.setTextData(explanation);

        StickyNoteLinkCreationData linkToCreate = new StickyNoteLinkCreationData();
        linkToCreate.setSrcDocumentId(docId);
        linkToCreate.setDestinationCardId(workCardId);
        linkToCreate.setTeaser(teaser);
        linkToCreate.setExplanation(explanationBlock);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(linkToCreate);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(docId, persistedLink.getSrcDocumentId());
        Assertions.assertEquals(workCardId, persistedLink.getDestinationCardId());
        Assertions.assertEquals(teaser, persistedLink.getTeaser());

        Assertions.assertNotNull(persistedLink.getExplanationId());
        TextDataBlock persistedExplanationBlock = (TextDataBlock) client.documentRestEndpoint
            .getDocument(persistedLink.getExplanationId());
        Assertions.assertNotNull(persistedExplanationBlock);
        Assertions.assertEquals(DEFAULT_MIME_TYPE, persistedExplanationBlock.getMimeType());
        Assertions.assertEquals(explanation, persistedExplanationBlock.getTextData());
        Assertions.assertNull(persistedExplanationBlock.getOwningCardContentId());
        Assertions.assertNull(persistedExplanationBlock.getOwningResourceId());

        List<StickyNoteLink> blockLinks = client.documentRestEndpoint
            .getStickyNoteLinksAsSrc(docId);
        Assertions.assertNotNull(blockLinks);
        Assertions.assertEquals(1, blockLinks.size());
        Assertions.assertEquals(linkId, blockLinks.get(0).getId());
    }

    @Test
    public void testUpdateStickyNoteLink() {
        Project project = ColabFactory.createProject(client, "testUpdateStickyNoteLink");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        StickyNoteLinkCreationData linkToCreate = new StickyNoteLinkCreationData();
        linkToCreate.setSrcCardId(cardId);
        linkToCreate.setDestinationCardId(workCardId);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(linkToCreate);

        StickyNoteLink link = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(link);
        Assertions.assertNull(link.getTeaser());

        String teaser = "remember me #" + ((int) (Math.random() * 1000));

        link.setTeaser(teaser);
        client.stickyNoteLinkRestEndpoint.updateLink(link);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(teaser, persistedLink.getTeaser());
    }

    @Test
    public void testDeleteStickyNoteLink() {
        Project project = ColabFactory.createProject(client, "testDeleteStickyNoteLink");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        StickyNoteLinkCreationData linkToCreate = new StickyNoteLinkCreationData();
        linkToCreate.setSrcCardId(cardId);
        linkToCreate.setDestinationCardId(workCardId);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(linkToCreate);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(cardId, persistedLink.getSrcCardId());
        Assertions.assertEquals(workCardId, persistedLink.getDestinationCardId());

        Assertions.assertNotNull(persistedLink.getExplanationId());
        Long explanationId = persistedLink.getExplanationId();
        TextDataBlock persistedExplanationBlock = (TextDataBlock) client.documentRestEndpoint
            .getDocument(persistedLink.getExplanationId());
        Assertions.assertNotNull(persistedExplanationBlock);
        Assertions.assertEquals(DEFAULT_MIME_TYPE, persistedExplanationBlock.getMimeType());
        Assertions.assertNull(persistedExplanationBlock.getTextData());
        Assertions.assertNull(persistedExplanationBlock.getOwningCardContentId());
        Assertions.assertNull(persistedExplanationBlock.getOwningResourceId());

        List<StickyNoteLink> workCardLinks = client.cardRestEndpoint
            .getStickyNoteLinksAsDest(workCardId);
        Assertions.assertNotNull(workCardLinks);
        Assertions.assertEquals(1, workCardLinks.size());
        Assertions.assertEquals(linkId, workCardLinks.get(0).getId());

        List<StickyNoteLink> cardLinks = client.cardRestEndpoint.getStickyNoteLinksAsSrc(cardId);
        Assertions.assertNotNull(cardLinks);
        Assertions.assertEquals(1, cardLinks.size());
        Assertions.assertEquals(linkId, cardLinks.get(0).getId());

        client.stickyNoteLinkRestEndpoint.deleteLink(linkId);

        persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNull(persistedLink);

        persistedExplanationBlock = (TextDataBlock) client.documentRestEndpoint
            .getDocument(explanationId);
        Assertions.assertNull(persistedExplanationBlock);

        workCardLinks = client.cardRestEndpoint.getStickyNoteLinksAsDest(workCardId);
        Assertions.assertNotNull(workCardLinks);
        Assertions.assertEquals(0, workCardLinks.size());

        cardLinks = client.cardRestEndpoint.getStickyNoteLinksAsSrc(cardId);
        Assertions.assertNotNull(cardLinks);
        Assertions.assertEquals(0, cardLinks.size());
    }

    @Test
    public void testChangeStickyNoteLinkSrcCardToCardContent() {
        Project project = ColabFactory.createProject(client, "testChangeStickyNoteLinkSrcCard");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long cardContentId = ColabFactory.getCardContent(client, cardId).getId();

        StickyNoteLinkCreationData linkToCreate = new StickyNoteLinkCreationData();
        linkToCreate.setSrcCardId(cardId);
        linkToCreate.setDestinationCardId(workCardId);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(linkToCreate);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(cardId, persistedLink.getSrcCardId());
        Assertions.assertNull(persistedLink.getSrcCardContentId());
        Assertions.assertNull(persistedLink.getSrcResourceOrRefId());
        Assertions.assertNull(persistedLink.getSrcDocumentId());

        List<StickyNoteLink> cardLinks = client.cardRestEndpoint
            .getStickyNoteLinksAsSrc(cardId);
        Assertions.assertNotNull(cardLinks);
        Assertions.assertEquals(1, cardLinks.size());
        Assertions.assertEquals(linkId, cardLinks.get(0).getId());

        List<StickyNoteLink> cardContentLinks = client.cardContentRestEndpoint
            .getStickyNoteLinksAsSrc(cardContentId);
        Assertions.assertNotNull(cardContentLinks);
        Assertions.assertEquals(0, cardContentLinks.size());

        client.stickyNoteLinkRestEndpoint.changeSrcWithCardContent(persistedLink.getId(),
            cardContentId);

        persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertNull(persistedLink.getSrcCardId());
        Assertions.assertEquals(cardContentId, persistedLink.getSrcCardContentId());
        Assertions.assertNull(persistedLink.getSrcResourceOrRefId());
        Assertions.assertNull(persistedLink.getSrcDocumentId());

        cardLinks = client.cardRestEndpoint.getStickyNoteLinksAsSrc(cardId);
        Assertions.assertNotNull(cardLinks);
        Assertions.assertEquals(0, cardLinks.size());

        cardContentLinks = client.cardContentRestEndpoint.getStickyNoteLinksAsSrc(cardContentId);
        Assertions.assertNotNull(cardContentLinks);
        Assertions.assertEquals(1, cardContentLinks.size());
        Assertions.assertEquals(linkId, cardContentLinks.get(0).getId());
    }

    @Test
    public void testChangeStickyNoteLinkSrcCardContentToCard() {
        Project project = ColabFactory.createProject(client,
            "testChangeStickyNoteLinkSrcCardContent");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long cardContentId = ColabFactory.getCardContent(client, cardId).getId();

        StickyNoteLinkCreationData linkToCreate = new StickyNoteLinkCreationData();
        linkToCreate.setSrcCardContentId(cardContentId);
        linkToCreate.setDestinationCardId(workCardId);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(linkToCreate);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertNull(persistedLink.getSrcCardId());
        Assertions.assertEquals(cardContentId, persistedLink.getSrcCardContentId());
        Assertions.assertNull(persistedLink.getSrcResourceOrRefId());
        Assertions.assertNull(persistedLink.getSrcDocumentId());

        List<StickyNoteLink> cardContentLinks = client.cardContentRestEndpoint
            .getStickyNoteLinksAsSrc(cardContentId);
        Assertions.assertNotNull(cardContentLinks);
        Assertions.assertEquals(1, cardContentLinks.size());
        Assertions.assertEquals(linkId, cardContentLinks.get(0).getId());

        List<StickyNoteLink> cardLinks = client.cardRestEndpoint.getStickyNoteLinksAsSrc(cardId);
        Assertions.assertNotNull(cardLinks);
        Assertions.assertEquals(0, cardLinks.size());

        client.stickyNoteLinkRestEndpoint.changeSrcWithCard(persistedLink.getId(), cardId);

        persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(cardId, persistedLink.getSrcCardId());
        Assertions.assertNull(persistedLink.getSrcCardContentId());
        Assertions.assertNull(persistedLink.getSrcResourceOrRefId());
        Assertions.assertNull(persistedLink.getSrcDocumentId());

        cardContentLinks = client.cardContentRestEndpoint
            .getStickyNoteLinksAsSrc(cardContentId);
        Assertions.assertNotNull(cardContentLinks);
        Assertions.assertEquals(0, cardContentLinks.size());

        cardLinks = client.cardRestEndpoint
            .getStickyNoteLinksAsSrc(cardId);
        Assertions.assertNotNull(cardLinks);
        Assertions.assertEquals(1, cardLinks.size());
        Assertions.assertEquals(linkId, cardLinks.get(0).getId());
    }

    @Test
    public void testChangeStickyNoteLinkSrcResourceToDocument() {
        Project project = ColabFactory.createProject(client,
            "testChangeStickyNoteLinkSrcResource");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long resourceId = ColabFactory.createCardResource(client, cardId, "soft cakes").getId();

        List<Document> docs = client.resourceRestEndpoint.getDocumentsOfResource(resourceId);
        Long documentId = docs.get(0).getId();

        StickyNoteLinkCreationData linkToCreate = new StickyNoteLinkCreationData();
        linkToCreate.setSrcResourceOrRefId(resourceId);
        linkToCreate.setDestinationCardId(workCardId);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(linkToCreate);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertNull(persistedLink.getSrcCardId());
        Assertions.assertNull(persistedLink.getSrcCardContentId());
        Assertions.assertEquals(resourceId, persistedLink.getSrcResourceOrRefId());
        Assertions.assertNull(persistedLink.getSrcDocumentId());

        List<StickyNoteLink> resourceLinks = client.resourceRestEndpoint
            .getStickyNoteLinksAsSrc(resourceId);
        Assertions.assertNotNull(resourceLinks);
        Assertions.assertEquals(1, resourceLinks.size());
        Assertions.assertEquals(linkId, resourceLinks.get(0).getId());

        List<StickyNoteLink> blockLinks = client.documentRestEndpoint
            .getStickyNoteLinksAsSrc(documentId);
        Assertions.assertNotNull(blockLinks);
        Assertions.assertEquals(0, blockLinks.size());

        client.stickyNoteLinkRestEndpoint.changeSrcWithDocument(persistedLink.getId(), documentId);

        persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertNull(persistedLink.getSrcCardId());
        Assertions.assertNull(persistedLink.getSrcCardContentId());
        Assertions.assertNull(persistedLink.getSrcResourceOrRefId());
        Assertions.assertEquals(documentId, persistedLink.getSrcDocumentId());

        resourceLinks = client.resourceRestEndpoint.getStickyNoteLinksAsSrc(resourceId);
        Assertions.assertNotNull(resourceLinks);
        Assertions.assertEquals(0, resourceLinks.size());

        blockLinks = client.documentRestEndpoint.getStickyNoteLinksAsSrc(documentId);
        Assertions.assertNotNull(blockLinks);
        Assertions.assertEquals(1, blockLinks.size());
        Assertions.assertEquals(linkId, blockLinks.get(0).getId());
    }

    @Test
    public void testChangeStickyNoteLinkSrcDocumentToResource() {
        Project project = ColabFactory.createProject(client, "testChangeStickyNoteLinkSrcDocument");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long resourceId = ColabFactory.createTextDataBlockCardResource(client, cardId, "soft cakes")
            .getId();

        List<Document> docs = client.resourceRestEndpoint.getDocumentsOfResource(resourceId);
        TextDataBlock document = (TextDataBlock) docs.get(0);
        Long docId = document.getId();

        StickyNoteLinkCreationData linkToCreate = new StickyNoteLinkCreationData();
        linkToCreate.setSrcDocumentId(docId);
        linkToCreate.setDestinationCardId(workCardId);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(linkToCreate);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertNull(persistedLink.getSrcCardId());
        Assertions.assertNull(persistedLink.getSrcCardContentId());
        Assertions.assertNull(persistedLink.getSrcResourceOrRefId());
        Assertions.assertEquals(docId, persistedLink.getSrcDocumentId());

        List<StickyNoteLink> blockLinks = client.documentRestEndpoint
            .getStickyNoteLinksAsSrc(docId);
        Assertions.assertNotNull(blockLinks);
        Assertions.assertEquals(1, blockLinks.size());
        Assertions.assertEquals(linkId, blockLinks.get(0).getId());

        List<StickyNoteLink> resourceLinks = client.resourceRestEndpoint
            .getStickyNoteLinksAsSrc(resourceId);
        Assertions.assertNotNull(resourceLinks);
        Assertions.assertEquals(0, resourceLinks.size());

        client.stickyNoteLinkRestEndpoint.changeSrcWithResourceOrRef(persistedLink.getId(),
            resourceId);

        persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertNull(persistedLink.getSrcCardId());
        Assertions.assertNull(persistedLink.getSrcCardContentId());
        Assertions.assertEquals(resourceId, persistedLink.getSrcResourceOrRefId());
        Assertions.assertNull(persistedLink.getSrcDocumentId());

        blockLinks = client.documentRestEndpoint.getStickyNoteLinksAsSrc(docId);
        Assertions.assertNotNull(blockLinks);
        Assertions.assertEquals(0, blockLinks.size());

        resourceLinks = client.resourceRestEndpoint.getStickyNoteLinksAsSrc(resourceId);
        Assertions.assertNotNull(resourceLinks);
        Assertions.assertEquals(1, resourceLinks.size());
        Assertions.assertEquals(linkId, resourceLinks.get(0).getId());
    }

    @Test
    public void testChangeStickyNoteLinkDestination() {
        Project project = ColabFactory.createProject(client, "testChangeStickyNoteLinkDestination");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        StickyNoteLinkCreationData linkToCreate = new StickyNoteLinkCreationData();
        linkToCreate.setSrcCardId(cardId);
        linkToCreate.setDestinationCardId(workCardId);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(linkToCreate);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(workCardId, persistedLink.getDestinationCardId());

        List<StickyNoteLink> cardLinks = client.cardRestEndpoint
            .getStickyNoteLinksAsDest(workCardId);
        Assertions.assertNotNull(cardLinks);
        Assertions.assertEquals(1, cardLinks.size());
        Assertions.assertEquals(linkId, cardLinks.get(0).getId());

        Long anotherWorkCardId = ColabFactory.createNewCard(client, project).getId();

        client.stickyNoteLinkRestEndpoint.changeDestination(persistedLink.getId(),
            anotherWorkCardId);

        persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(anotherWorkCardId, persistedLink.getDestinationCardId());

        cardLinks = client.cardRestEndpoint.getStickyNoteLinksAsDest(workCardId);
        Assertions.assertNotNull(cardLinks);
        Assertions.assertEquals(0, cardLinks.size());

        List<StickyNoteLink> otherCardLinks = client.cardRestEndpoint
            .getStickyNoteLinksAsDest(anotherWorkCardId);
        Assertions.assertNotNull(otherCardLinks);
        Assertions.assertEquals(1, otherCardLinks.size());
        Assertions.assertEquals(linkId, otherCardLinks.get(0).getId());
    }

}

