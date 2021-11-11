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
import ch.colabproject.colab.api.rest.document.ResourceCreationBean;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of the resource rest end point from a client point of view
 *
 * @author sandra
 */
// TODO refuse stuff
// TODO publish / requestForGlory / deprecated stuff
public class ResourceAndReferenceTest extends AbstractArquillianTest {

    @Test
    public void testOnGlobalCardType() {
        doTest(Access.GLOBAL_CARD_TYPE,
            Set.of(Access.CARD_TYPE_REF, Access.CARD, Access.CARD_CONTENT));
        // the resources on a card type are not accessible from the sub cards
    }

    @Test
    public void testOnCardTypeRef() {
        doTest(Access.CARD_TYPE_REF,
            Set.of(Access.CARD, Access.CARD_CONTENT));
        // the resources on a card type reference are not accessible from the sub cards
    }

    @Test
    public void testOnCard() {
        doTest(Access.CARD,
            Set.of(Access.CARD_CONTENT,
                Access.SUB_CARD, Access.SUB_CARD_CONTENT));
    }

    @Test
    public void testOnCardContent() {
        doTest(Access.CARD_CONTENT,
            Set.of(Access.SUB_CARD, Access.SUB_CARD_CONTENT));
    }

    @Test
    public void testOnSubCardLocalType() {
        doTest(Access.SUB_CARD_TYPE,
            Set.of(Access.SUB_CARD, Access.SUB_CARD_CONTENT));
    }

    @Test
    public void testOnSubCard() {
        doTest(Access.SUB_CARD,
            Set.of(Access.SUB_CARD_CONTENT));
    }

    @Test
    public void testOnSubCardContent() {
        doTest(Access.SUB_CARD_CONTENT,
            Set.of());
    }

    private enum Access {
        GLOBAL_CARD_TYPE,
        CARD_TYPE_REF,
        CARD,
        CARD_CONTENT,
        SUB_CARD_TYPE,
        SUB_CARD,
        SUB_CARD_CONTENT;
    }

    private void doTest(Access resourceLocation, Set<Access> accessToResourceRef) {
        // creation of the context : project, global card type, card type, card, sub card
        Project project = ColabFactory.createProject(client, "testResource");
        Long projectId = project.getId();

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        Long globalCardTypeId = ColabFactory.createCardType(client, null).getId();

        Long cardId = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId)
            .getId();

        Long cardTypeRefId = client.cardRestEndpoint.getCard(cardId).getCardTypeId();

        Long cardContentId = ColabFactory.getCardContent(client, cardId).getId();

        Long subCardLocalTypeId = ColabFactory.createCardType(client, projectId).getId();

        Long subCardId = ColabFactory.createNewCard(client, cardContentId, subCardLocalTypeId).getId();

        Long subCardContentId = ColabFactory.getCardContent(client, subCardId).getId();

        // creation of a resource

        String category = "awesome resources #" + ((int) (Math.random() * 1000));
        String title = "The game encyclopedia #" + ((int) (Math.random() * 1000));
        String mimeType = "text/markdown";
        String teaser = "Word by word descriptions #" + ((int) (Math.random() * 1000));
        String url = "http://www.123soleil.chat/theGameEncyclopedia.pdf";

        ExternalLink doc = new ExternalLink();
        doc.setUrl(url);

        Long persistedResourceId;
        Resource persistedResource;

        TextDataBlock tea = new TextDataBlock();
        tea.setMimeType(mimeType);
        tea.setTextData(teaser);

        ResourceCreationBean toCreate = new ResourceCreationBean();
        toCreate.setTitle(title);
        toCreate.setTeaser(tea);
        toCreate.setDocument(doc);
        toCreate.setCategory(category);

        switch (resourceLocation) {
            case GLOBAL_CARD_TYPE:
                toCreate.setAbstractCardTypeId(globalCardTypeId);
                persistedResourceId = client.resourceRestEndpoint.createResource(toCreate);
                persistedResource = (Resource) client.resourceRestEndpoint
                    .getAbstractResource(persistedResourceId);
                break;
            case CARD_TYPE_REF:
                toCreate.setAbstractCardTypeId(cardTypeRefId);
                persistedResourceId = client.resourceRestEndpoint.createResource(toCreate);
                persistedResource = (Resource) client.resourceRestEndpoint
                    .getAbstractResource(persistedResourceId);
                break;
            case CARD:
                toCreate.setCardId(cardId);
                persistedResourceId = client.resourceRestEndpoint.createResource(toCreate);
                persistedResource = (Resource) client.resourceRestEndpoint
                    .getAbstractResource(persistedResourceId);
                break;
            case CARD_CONTENT:
                toCreate.setCardContentId(cardContentId);
                persistedResourceId = client.resourceRestEndpoint.createResource(toCreate);
                persistedResource = (Resource) client.resourceRestEndpoint
                    .getAbstractResource(persistedResourceId);
                break;
            case SUB_CARD_TYPE:
                toCreate.setAbstractCardTypeId(subCardLocalTypeId);
                persistedResourceId = client.resourceRestEndpoint.createResource(toCreate);
                persistedResource = (Resource) client.resourceRestEndpoint
                    .getAbstractResource(persistedResourceId);
                break;
            case SUB_CARD:
                toCreate.setCardId(subCardId);
                persistedResourceId = client.resourceRestEndpoint.createResource(toCreate);
                persistedResource = (Resource) client.resourceRestEndpoint
                    .getAbstractResource(persistedResourceId);
                break;
            case SUB_CARD_CONTENT:
                toCreate.setCardContentId(subCardContentId);
                persistedResourceId = client.resourceRestEndpoint.createResource(toCreate);
                persistedResource = (Resource) client.resourceRestEndpoint
                    .getAbstractResource(persistedResourceId);
                break;
            default:
                Assertions.fail();
                persistedResource = new Resource(); // just for compilation / code checks
                break;
        }

        // create sister card and variant after the resource creation

        Long otherCardContentId = ColabFactory.createNewCardContent(client, cardId).getId();

        Long sisterCardId = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId)
            .getId();

        Long sisterCardContentId = ColabFactory.getCardContent(client, sisterCardId).getId();

        Long sisterSubCardId = ColabFactory.createNewCard(client, cardContentId, subCardLocalTypeId)
            .getId();

        Long sisterSubCardContentId = ColabFactory.getCardContent(client, sisterSubCardId).getId();

        // check the abstract card type / card / card content link with the resource

        Assertions.assertNotNull(persistedResource);
        Assertions.assertNotNull(persistedResource.getId());
        Assertions.assertEquals(title, persistedResource.getTitle());
        switch (resourceLocation) {
            case GLOBAL_CARD_TYPE:
                Assertions.assertEquals(globalCardTypeId,
                    persistedResource.getAbstractCardTypeId());
                Assertions.assertNull(persistedResource.getCardId());
                Assertions.assertNull(persistedResource.getCardContentId());
                break;
            case CARD_TYPE_REF:
                Assertions.assertEquals(cardTypeRefId, persistedResource.getAbstractCardTypeId());
                Assertions.assertNull(persistedResource.getCardId());
                Assertions.assertNull(persistedResource.getCardContentId());
                break;
            case CARD:
                Assertions.assertNull(persistedResource.getAbstractCardTypeId());
                Assertions.assertEquals(cardId, persistedResource.getCardId());
                Assertions.assertNull(persistedResource.getCardContentId());
                break;
            case CARD_CONTENT:
                Assertions.assertNull(persistedResource.getAbstractCardTypeId());
                Assertions.assertNull(persistedResource.getCardId());
                Assertions.assertEquals(cardContentId, persistedResource.getCardContentId());
                break;
            case SUB_CARD_TYPE:
                Assertions.assertEquals(subCardLocalTypeId, persistedResource.getAbstractCardTypeId());
                Assertions.assertNull(persistedResource.getCardId());
                Assertions.assertNull(persistedResource.getCardContentId());
                break;
            case SUB_CARD:
                Assertions.assertNull(persistedResource.getAbstractCardTypeId());
                Assertions.assertEquals(subCardId, persistedResource.getCardId());
                Assertions.assertNull(persistedResource.getCardContentId());
                break;
            case SUB_CARD_CONTENT:
                Assertions.assertNull(persistedResource.getAbstractCardTypeId());
                Assertions.assertNull(persistedResource.getCardId());
                Assertions.assertEquals(subCardContentId, persistedResource.getCardContentId());
                break;
            default:
                Assertions.fail();
        }

        // check the teaser

        Long teaserId = persistedResource.getTeaserId();
        Block persistedTeaserBlock = client.blockRestEndPoint.getBlock(teaserId);
        Assertions.assertNotNull(persistedTeaserBlock);
        Assertions.assertEquals(teaserId, persistedTeaserBlock.getId());
        Assertions.assertTrue(persistedTeaserBlock instanceof TextDataBlock);
        TextDataBlock persistedTeaserTextDataBlock = (TextDataBlock) persistedTeaserBlock;
        Assertions.assertEquals(mimeType, persistedTeaserTextDataBlock.getMimeType());
        Assertions.assertEquals(teaser, persistedTeaserTextDataBlock.getTextData());

        // check the document

        Long documentId = persistedResource.getDocumentId();
        Document persistedDocument = client.documentRestEndPoint.getDocument(documentId);
        Assertions.assertNotNull(persistedDocument);
        Assertions.assertEquals(documentId, persistedDocument.getId());
        Assertions.assertTrue(persistedDocument instanceof ExternalLink);
        ExternalLink persistedExtDocLink = (ExternalLink) persistedDocument;
        Assertions.assertEquals(url, persistedExtDocLink.getUrl());
        Assertions.assertEquals(persistedResource.getId(), persistedDocument.getResourceId());

        // check the resource references

        AbstractResource persistedGlobalCardTypeAbstractResource = null;
        List<List<AbstractResource>> persistedGlobalCardTypeResources = client.resourceRestEndpoint
            .getResourceChainForAbstractCardType(globalCardTypeId);
        if (resourceLocation == Access.GLOBAL_CARD_TYPE) {
            Assertions.assertNotNull(persistedGlobalCardTypeResources);
            Assertions.assertEquals(1, persistedGlobalCardTypeResources.size());
            Assertions.assertEquals(1, persistedGlobalCardTypeResources.get(0).size());
            Assertions.assertNotNull(persistedGlobalCardTypeResources.get(0).get(0));
            Assertions
                .assertTrue(persistedGlobalCardTypeResources.get(0).get(0) instanceof Resource);
            persistedGlobalCardTypeAbstractResource = persistedGlobalCardTypeResources.get(0)
                .get(0);
            Assertions.assertEquals(persistedResource, persistedGlobalCardTypeAbstractResource);
        } else {
            Assertions.assertNotNull(persistedGlobalCardTypeResources);
            Assertions.assertEquals(0, persistedGlobalCardTypeResources.size());
        }

        AbstractResource persistedCardTypeRefAbstractResource = null;
        List<List<AbstractResource>> persistedCardTypeRefResources = client.resourceRestEndpoint
            .getResourceChainForAbstractCardType(cardTypeRefId);
        if (resourceLocation == Access.CARD_TYPE_REF) {
            Assertions.assertNotNull(persistedCardTypeRefResources);
            Assertions.assertEquals(1, persistedCardTypeRefResources.size());
            Assertions.assertEquals(1, persistedCardTypeRefResources.get(0).size());
            Assertions.assertNotNull(persistedCardTypeRefResources.get(0).get(0));
            Assertions.assertTrue(persistedCardTypeRefResources.get(0).get(0) instanceof Resource);
            persistedCardTypeRefAbstractResource = persistedCardTypeRefResources.get(0).get(0);
            Assertions.assertEquals(persistedResource, persistedCardTypeRefAbstractResource);
        } else if (accessToResourceRef.contains(Access.CARD_TYPE_REF)) {
            Assertions.assertNotNull(persistedCardTypeRefResources);
            Assertions.assertEquals(1, persistedCardTypeRefResources.size());
            Assertions.assertTrue(persistedCardTypeRefResources.get(0).size() > 1);
            Assertions
                .assertTrue(persistedCardTypeRefResources.get(0).get(0) instanceof ResourceRef);
            persistedCardTypeRefAbstractResource = persistedCardTypeRefResources
                .get(0).get(0);
            Assertions.assertNotNull(persistedGlobalCardTypeAbstractResource);
            Assertions.assertEquals(persistedGlobalCardTypeAbstractResource.getId(),
                ((ResourceRef) persistedCardTypeRefAbstractResource).getTargetId());
        } else {
            Assertions.assertNotNull(persistedCardTypeRefResources);
            Assertions.assertEquals(0, persistedCardTypeRefResources.size());
        }

        AbstractResource persistedCardAbstractResource = null;
        List<List<AbstractResource>> persistedCardResources = client.resourceRestEndpoint
            .getResourceChainForCard(cardId);
        if (resourceLocation == Access.CARD) {
            Assertions.assertNotNull(persistedCardResources);
            Assertions.assertEquals(1, persistedCardResources.size());
            Assertions.assertEquals(1, persistedCardResources.get(0).size());
            Assertions.assertNotNull(persistedCardResources.get(0).get(0));
            Assertions.assertTrue(persistedCardResources.get(0).get(0) instanceof Resource);
            persistedCardAbstractResource = persistedCardResources.get(0).get(0);
            Assertions.assertEquals(persistedResource, persistedCardAbstractResource);
        } else if (accessToResourceRef.contains(Access.CARD)) {
            Assertions.assertNotNull(persistedCardResources);
            Assertions.assertEquals(1, persistedCardResources.size());
            Assertions.assertTrue(persistedCardResources.get(0).size() > 1);
            Assertions.assertTrue(persistedCardResources.get(0).get(0) instanceof ResourceRef);
            persistedCardAbstractResource = persistedCardResources.get(0).get(0);
            Assertions.assertNotNull(persistedCardTypeRefAbstractResource);
            Assertions.assertEquals(persistedCardTypeRefAbstractResource.getId(),
                ((ResourceRef) persistedCardAbstractResource).getTargetId());
        } else {
            Assertions.assertNotNull(persistedCardResources);
            Assertions.assertEquals(0, persistedCardResources.size());
        }

        AbstractResource persistedSisterCardAbstractResource = null;
        List<List<AbstractResource>> persistedSisterCardResources = client.resourceRestEndpoint
            .getResourceChainForCard(sisterCardId);
        if (accessToResourceRef.contains(Access.CARD)) {
            Assertions.assertNotNull(persistedSisterCardResources);
            Assertions.assertEquals(1, persistedSisterCardResources.size());
            Assertions.assertTrue(persistedSisterCardResources.get(0).size() > 1);
            Assertions
                .assertTrue(persistedSisterCardResources.get(0).get(0) instanceof ResourceRef);
            persistedSisterCardAbstractResource = persistedSisterCardResources.get(0).get(0);
            Assertions.assertNotNull(persistedCardTypeRefAbstractResource);
            Assertions.assertEquals(persistedCardTypeRefAbstractResource.getId(),
                ((ResourceRef) persistedSisterCardAbstractResource).getTargetId());
        } else {
            Assertions.assertNotNull(persistedSisterCardResources);
            Assertions.assertEquals(0, persistedSisterCardResources.size());
        }

        AbstractResource persistedCardContentAbstractResource = null;
        List<List<AbstractResource>> persistedCardContentResources = client.resourceRestEndpoint
            .getResourceChainForCardContent(cardContentId);
        if (resourceLocation == Access.CARD_CONTENT) {
            Assertions.assertNotNull(persistedCardContentResources);
            Assertions.assertEquals(1, persistedCardContentResources.size());
            Assertions.assertEquals(1, persistedCardContentResources.get(0).size());
            Assertions.assertNotNull(persistedCardContentResources.get(0).get(0));
            Assertions.assertTrue(persistedCardContentResources.get(0).get(0) instanceof Resource);
            persistedCardContentAbstractResource = persistedCardContentResources.get(0).get(0);
            Assertions.assertEquals(persistedResource, persistedCardContentAbstractResource);
        } else if (accessToResourceRef.contains(Access.CARD_CONTENT)) {
            Assertions.assertNotNull(persistedCardContentResources);
            Assertions.assertEquals(1, persistedCardContentResources.size());
            Assertions.assertTrue(persistedCardContentResources.get(0).size() > 1);
            Assertions
                .assertTrue(persistedCardContentResources.get(0).get(0) instanceof ResourceRef);
            persistedCardContentAbstractResource = persistedCardContentResources
                .get(0).get(0);
            Assertions.assertNotNull(persistedCardAbstractResource);
            Assertions.assertEquals(persistedCardAbstractResource.getId(),
                ((ResourceRef) persistedCardContentAbstractResource).getTargetId());
        } else {
            Assertions.assertNotNull(persistedCardContentResources);
            Assertions.assertEquals(0, persistedCardContentResources.size());
        }

        AbstractResource persistedSisterCardContentAbstractResource = null;
        List<List<AbstractResource>> persistedSisterCardContentResources = client.resourceRestEndpoint
            .getResourceChainForCardContent(sisterCardContentId);
        if (accessToResourceRef.contains(Access.CARD_CONTENT) && resourceLocation != Access.CARD) {
            Assertions.assertNotNull(persistedSisterCardContentResources);
            Assertions.assertEquals(1, persistedSisterCardContentResources.size());
            Assertions.assertTrue(persistedSisterCardContentResources.get(0).size() > 1);
            Assertions
                .assertTrue(
                    persistedSisterCardContentResources.get(0).get(0) instanceof ResourceRef);
            persistedSisterCardContentAbstractResource = persistedSisterCardContentResources
                .get(0).get(0);
            Assertions.assertNotNull(persistedSisterCardAbstractResource);
            Assertions.assertEquals(persistedSisterCardAbstractResource.getId(),
                ((ResourceRef) persistedSisterCardContentAbstractResource).getTargetId());
        } else {
            Assertions.assertNotNull(persistedSisterCardContentResources);
            Assertions.assertEquals(0, persistedSisterCardContentResources.size());
        }

        AbstractResource persistedOtherCardContentAbstractResource = null;
        List<List<AbstractResource>> persistedOtherCardContentResources = client.resourceRestEndpoint
            .getResourceChainForCardContent(otherCardContentId);
        if (accessToResourceRef.contains(Access.CARD_CONTENT)) {
            Assertions.assertNotNull(persistedOtherCardContentResources);
            Assertions.assertEquals(1, persistedOtherCardContentResources.size());
            Assertions.assertTrue(persistedOtherCardContentResources.get(0).size() > 1);
            Assertions.assertTrue(
                persistedOtherCardContentResources.get(0).get(0) instanceof ResourceRef);
            persistedOtherCardContentAbstractResource = persistedOtherCardContentResources.get(0)
                .get(0);
            Assertions.assertNotNull(persistedCardAbstractResource);
            Assertions.assertEquals(persistedCardAbstractResource.getId(),
                ((ResourceRef) persistedOtherCardContentAbstractResource).getTargetId());
        } else {
            Assertions.assertNotNull(persistedOtherCardContentResources);
            Assertions.assertEquals(0, persistedOtherCardContentResources.size());
        }

        AbstractResource persistedSubCardTypeAbstractResource = null;
        List<List<AbstractResource>> persistedSubCardTypeResources = client.resourceRestEndpoint
            .getResourceChainForAbstractCardType(subCardLocalTypeId);
        if (resourceLocation == Access.SUB_CARD_TYPE) {
            Assertions.assertNotNull(persistedSubCardTypeResources);
            Assertions.assertEquals(1, persistedSubCardTypeResources.size());
            Assertions.assertEquals(1, persistedSubCardTypeResources.get(0).size());
            Assertions.assertNotNull(persistedSubCardTypeResources.get(0).get(0));
            Assertions.assertTrue(persistedSubCardTypeResources.get(0).get(0) instanceof Resource);
            persistedSubCardTypeAbstractResource = persistedSubCardTypeResources.get(0).get(0);
            Assertions.assertEquals(persistedResource, persistedSubCardTypeAbstractResource);
        } else if (accessToResourceRef.contains(Access.SUB_CARD_TYPE)) {
            Assertions.fail("not handled in current example");
        } else {
            Assertions.assertNotNull(persistedSubCardTypeResources);
            Assertions.assertEquals(0, persistedSubCardTypeResources.size());
        }

        AbstractResource persistedSubCardResourceRef = null;
        List<List<AbstractResource>> persistedSubCardResources = client.resourceRestEndpoint
            .getResourceChainForCard(subCardId);
        if (resourceLocation == Access.SUB_CARD) {
            Assertions.assertNotNull(persistedSubCardResources);
            Assertions.assertEquals(1, persistedSubCardResources.size());
            Assertions.assertEquals(1, persistedSubCardResources.get(0).size());
            Assertions.assertNotNull(persistedSubCardResources.get(0).get(0));
            Assertions.assertTrue(persistedSubCardResources.get(0).get(0) instanceof Resource);
            persistedSubCardResourceRef = persistedSubCardResources.get(0).get(0);
            Assertions.assertEquals(persistedResource, persistedSubCardResourceRef);
        } else if (accessToResourceRef.contains(Access.SUB_CARD)) {
            Assertions.assertNotNull(persistedSubCardResources);
            Assertions.assertEquals(1, persistedSubCardResources.size());
            Assertions.assertTrue(persistedSubCardResources.get(0).size() > 1);
            Assertions.assertTrue(persistedSubCardResources.get(0).get(0) instanceof ResourceRef);
            persistedSubCardResourceRef = persistedSubCardResources.get(0).get(0);
            Assertions.assertTrue(persistedCardContentAbstractResource != null
                || persistedSubCardTypeAbstractResource != null);
            if (persistedCardContentAbstractResource != null) {
                Assertions.assertEquals(persistedCardContentAbstractResource.getId(),
                    ((ResourceRef) persistedSubCardResourceRef).getTargetId());
            } else if (persistedSubCardTypeAbstractResource != null) {
                Assertions.assertEquals(persistedSubCardTypeAbstractResource.getId(),
                    ((ResourceRef) persistedSubCardResourceRef).getTargetId());
            } else {
                Assertions.fail(
                    "a sub card resource reference must be linked to its card type reference or to its parent card content reference ");
            }
        } else {
            Assertions.assertNotNull(persistedSubCardResources);
            Assertions.assertEquals(0, persistedSubCardResources.size());
        }

        AbstractResource persistedSisterSubCardResourceRef = null;
        List<List<AbstractResource>> persistedSisterSubCardResources = client.resourceRestEndpoint
            .getResourceChainForCard(sisterSubCardId);
        if (accessToResourceRef.contains(Access.SUB_CARD)) {
            Assertions.assertNotNull(persistedSisterSubCardResources);
            Assertions.assertEquals(1, persistedSisterSubCardResources.size());
            Assertions.assertTrue(persistedSisterSubCardResources.get(0).size() > 1);
            Assertions
                .assertTrue(persistedSisterSubCardResources.get(0).get(0) instanceof ResourceRef);
            persistedSisterSubCardResourceRef = persistedSisterSubCardResources.get(0).get(0);
            Assertions.assertTrue(persistedCardContentAbstractResource != null
                || persistedSubCardTypeAbstractResource != null);
            if (persistedCardContentAbstractResource != null) {
                Assertions.assertEquals(persistedCardContentAbstractResource.getId(),
                    ((ResourceRef) persistedSisterSubCardResourceRef).getTargetId());
            } else if (persistedSubCardTypeAbstractResource != null) {
                Assertions.assertEquals(persistedSubCardTypeAbstractResource.getId(),
                    ((ResourceRef) persistedSisterSubCardResourceRef).getTargetId());
            } else {
                Assertions.fail(
                    "a sister sub card resource reference must be linked to its card type reference or to its parent card content reference ");
            }
        } else {
            Assertions.assertNotNull(persistedSisterSubCardResources);
            Assertions.assertEquals(0, persistedSisterSubCardResources.size());
        }

        AbstractResource persistedSubCardContentResourceRef = null;
        List<List<AbstractResource>> persistedSubCardContentResources = client.resourceRestEndpoint
            .getResourceChainForCardContent(subCardContentId);
        if (resourceLocation == Access.SUB_CARD_CONTENT) {
            Assertions.assertNotNull(persistedSubCardContentResources);
            Assertions.assertEquals(1, persistedSubCardContentResources.size());
            Assertions.assertEquals(1, persistedSubCardContentResources.get(0).size());
            Assertions.assertNotNull(persistedSubCardContentResources.get(0).get(0));
            Assertions
                .assertTrue(persistedSubCardContentResources.get(0).get(0) instanceof Resource);
            Assertions.assertEquals(persistedResource,
                persistedSubCardContentResources.get(0).get(0));
            persistedSubCardContentResourceRef = persistedSubCardContentResources.get(0).get(0);
            Assertions.assertEquals(persistedResource, persistedSubCardContentResourceRef);
        } else if (accessToResourceRef.contains(Access.SUB_CARD_CONTENT)) {
            Assertions.assertNotNull(persistedSubCardContentResources);
            Assertions.assertEquals(1, persistedSubCardContentResources.size());
            Assertions.assertTrue(persistedSubCardContentResources.get(0).size() > 1);
            Assertions
                .assertTrue(persistedSubCardContentResources.get(0).get(0) instanceof ResourceRef);
            persistedSubCardContentResourceRef = persistedSubCardContentResources
                .get(0).get(0);
            Assertions.assertNotNull(persistedSubCardResourceRef);
            Assertions.assertEquals(persistedSubCardResourceRef.getId(),
                ((ResourceRef) persistedSubCardContentResourceRef).getTargetId());
        } else {
            Assertions.assertNotNull(persistedSubCardContentResources);
            Assertions.assertEquals(0, persistedSubCardContentResources.size());
        }

        AbstractResource persistedSisterSubCardContentResourceRef = null;
        List<List<AbstractResource>> persistedSisterSubCardContentResources = client.resourceRestEndpoint
            .getResourceChainForCardContent(sisterSubCardContentId);
        if (accessToResourceRef.contains(Access.SUB_CARD_CONTENT)
            && resourceLocation != Access.SUB_CARD) {
            Assertions.assertNotNull(persistedSisterSubCardContentResources);
            Assertions.assertEquals(1, persistedSisterSubCardContentResources.size());
            Assertions.assertTrue(persistedSisterSubCardContentResources.get(0).size() > 1);
            Assertions
                .assertTrue(
                    persistedSisterSubCardContentResources.get(0).get(0) instanceof ResourceRef);
            persistedSisterSubCardContentResourceRef = persistedSisterSubCardContentResources
                .get(0).get(0);
            Assertions.assertNotNull(persistedSisterSubCardResourceRef);
            Assertions.assertEquals(persistedSisterSubCardResourceRef.getId(),
                ((ResourceRef) persistedSisterSubCardContentResourceRef).getTargetId());
        } else {
            Assertions.assertNotNull(persistedSisterSubCardContentResources);
            Assertions.assertEquals(0, persistedSisterSubCardContentResources.size());
        }

        // And now, delete the resource

        Long resourceId = persistedResource.getId();

        client.resourceRestEndpoint.deleteResource(resourceId);

        Assertions.assertNull(client.resourceRestEndpoint.getAbstractResource(resourceId));

        persistedGlobalCardTypeResources = client.resourceRestEndpoint
            .getResourceChainForAbstractCardType(globalCardTypeId);
        Assertions.assertNotNull(persistedGlobalCardTypeResources);
        Assertions.assertEquals(0, persistedGlobalCardTypeResources.size());

        persistedCardTypeRefResources = client.resourceRestEndpoint
            .getResourceChainForAbstractCardType(cardTypeRefId);
        Assertions.assertNotNull(persistedCardTypeRefResources);
        Assertions.assertEquals(0, persistedCardTypeRefResources.size());

        persistedCardResources = client.resourceRestEndpoint
            .getResourceChainForCard(cardId);
        Assertions.assertNotNull(persistedCardResources);
        Assertions.assertEquals(0, persistedCardResources.size());

        persistedCardContentResources = client.resourceRestEndpoint
            .getResourceChainForCardContent(cardContentId);
        Assertions.assertNotNull(persistedCardContentResources);
        Assertions.assertEquals(0, persistedCardContentResources.size());

        persistedSubCardTypeResources = client.resourceRestEndpoint
            .getResourceChainForAbstractCardType(subCardLocalTypeId);
        Assertions.assertNotNull(persistedSubCardTypeResources);
        Assertions.assertEquals(0, persistedSubCardTypeResources.size());

        persistedSubCardResources = client.resourceRestEndpoint
            .getResourceChainForCard(subCardId);
        Assertions.assertNotNull(persistedSubCardResources);
        Assertions.assertEquals(0, persistedSubCardResources.size());

        persistedSubCardContentResources = client.resourceRestEndpoint
            .getResourceChainForCardContent(subCardContentId);
        Assertions.assertNotNull(persistedSubCardContentResources);
        Assertions.assertEquals(0, persistedSubCardContentResources.size());
    }
}
