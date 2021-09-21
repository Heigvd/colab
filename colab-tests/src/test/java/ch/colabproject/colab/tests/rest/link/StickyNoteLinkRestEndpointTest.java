/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.link;

import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.project.Project;
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

    @Test
    public void testCreateStickyNoteLinkSrcCard() {
        String teaser = "remember me #" + ((int) (Math.random() * 1000));
        String explanation = "This resource explains exactly how to do a nice report #"
            + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client, "testCreateStickyNoteLinkSrcCard");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        StickyNoteLink link = new StickyNoteLink();
        link.setSrcCardId(cardId);
        link.setDestinationCardId(workCardId);
        link.setTeaser(teaser);
        link.setExplanation(explanation);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(link);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(cardId, persistedLink.getSrcCardId());
        Assertions.assertEquals(workCardId, persistedLink.getDestinationCardId());
        Assertions.assertEquals(teaser, persistedLink.getTeaser());
        Assertions.assertEquals(explanation, persistedLink.getExplanation());

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

        StickyNoteLink link = new StickyNoteLink();
        link.setSrcCardContentId(cardContentId);
        link.setDestinationCardId(workCardId);
        link.setTeaser(teaser);
        link.setExplanation(explanation);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(link);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(cardContentId, persistedLink.getSrcCardContentId());
        Assertions.assertEquals(workCardId, persistedLink.getDestinationCardId());
        Assertions.assertEquals(teaser, persistedLink.getTeaser());
        Assertions.assertEquals(explanation, persistedLink.getExplanation());

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

        StickyNoteLink link = new StickyNoteLink();
        link.setSrcResourceOrRefId(resourceId);
        link.setDestinationCardId(workCardId);
        link.setTeaser(teaser);
        link.setExplanation(explanation);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(link);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(resourceId, persistedLink.getSrcResourceOrRefId());
        Assertions.assertEquals(workCardId, persistedLink.getDestinationCardId());
        Assertions.assertEquals(teaser, persistedLink.getTeaser());
        Assertions.assertEquals(explanation, persistedLink.getExplanation());

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

        StickyNoteLink link = new StickyNoteLink();
        link.setSrcResourceOrRefId(resourceRefId);
        link.setDestinationCardId(workCardId);
        link.setTeaser(teaser);
        link.setExplanation(explanation);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(link);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(resourceRefId, persistedLink.getSrcResourceOrRefId());
        Assertions.assertEquals(workCardId, persistedLink.getDestinationCardId());
        Assertions.assertEquals(teaser, persistedLink.getTeaser());
        Assertions.assertEquals(explanation, persistedLink.getExplanation());

        List<StickyNoteLink> resourceLinks = client.resourceRestEndpoint
            .getStickyNoteLinksAsSrc(resourceRefId);
        Assertions.assertNotNull(resourceLinks);
        Assertions.assertEquals(1, resourceLinks.size());
        Assertions.assertEquals(linkId, resourceLinks.get(0).getId());
    }

    @Test
    public void testCreateStickyNoteLinkSrcBlock() {
        String teaser = "remember me #" + ((int) (Math.random() * 1000));
        String explanation = "This resource explains exactly how to do a nice report #"
            + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client, "testCreateStickyNoteLinkSrcBlock");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long resourceId = ColabFactory.createCardResource(client, cardId, "soft cakes").getId();

        Resource resource = (Resource) client.resourceRestEndpoint.getAbstractResource(resourceId);
        Block block = client.blockRestEndPoint.createNewTextDataBlock(resource.getDocumentId());
        Long blockId = block.getId();

        StickyNoteLink link = new StickyNoteLink();
        link.setSrcBlockId(blockId);
        link.setDestinationCardId(workCardId);
        link.setTeaser(teaser);
        link.setExplanation(explanation);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(link);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(blockId, persistedLink.getSrcBlockId());
        Assertions.assertEquals(workCardId, persistedLink.getDestinationCardId());
        Assertions.assertEquals(teaser, persistedLink.getTeaser());
        Assertions.assertEquals(explanation, persistedLink.getExplanation());

        List<StickyNoteLink> blockLinks = client.blockRestEndPoint.getStickyNoteLinksAsSrc(blockId);
        Assertions.assertNotNull(blockLinks);
        Assertions.assertEquals(1, blockLinks.size());
        Assertions.assertEquals(linkId, blockLinks.get(0).getId());
    }

    @Test
    public void testUpdateStickyNoteLink() {
        Project project = ColabFactory.createProject(client, "testUpdateStickyNoteLink");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        StickyNoteLink link = new StickyNoteLink();
        link.setSrcCardId(cardId);
        link.setDestinationCardId(workCardId);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(link);

        link = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(link);
        Assertions.assertNull(link.getTeaser());
        Assertions.assertNull(link.getExplanation());

        String teaser = "remember me #" + ((int) (Math.random() * 1000));
        String explanation = "This resource explains exactly how to do a nice report #"
            + ((int) (Math.random() * 1000));

        link.setTeaser(teaser);
        link.setExplanation(explanation);
        client.stickyNoteLinkRestEndpoint.updateLink(link);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(teaser, persistedLink.getTeaser());
        Assertions.assertEquals(explanation, persistedLink.getExplanation());
    }

    @Test
    public void testDeleteStickyNoteLink() {
        Project project = ColabFactory.createProject(client, "testDeleteStickyNoteLink");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        StickyNoteLink link = new StickyNoteLink();
        link.setSrcCardId(cardId);
        link.setDestinationCardId(workCardId);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(link);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(cardId, persistedLink.getSrcCardId());
        Assertions.assertEquals(workCardId, persistedLink.getDestinationCardId());

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

        workCardLinks = client.cardRestEndpoint.getStickyNoteLinksAsDest(workCardId);
        Assertions.assertNotNull(workCardLinks);
        Assertions.assertEquals(0, workCardLinks.size());

        cardLinks = client.cardRestEndpoint.getStickyNoteLinksAsSrc(cardId);
        Assertions.assertNotNull(cardLinks);
        Assertions.assertEquals(0, cardLinks.size());

    }

    @Test
    public void testChangeStickyNoteLinkSrcCard() {
        Project project = ColabFactory.createProject(client, "testChangeStickyNoteLinkSrcCard");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long cardContentId = ColabFactory.getCardContent(client, cardId).getId();

        StickyNoteLink link = new StickyNoteLink();
        link.setSrcCardId(cardId);
        link.setDestinationCardId(workCardId);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(link);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(cardId, persistedLink.getSrcCardId());
        Assertions.assertNull(persistedLink.getSrcCardContentId());
        Assertions.assertNull(persistedLink.getSrcResourceOrRefId());
        Assertions.assertNull(persistedLink.getSrcBlockId());

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
        Assertions.assertNull(persistedLink.getSrcBlockId());

        cardLinks = client.cardRestEndpoint.getStickyNoteLinksAsSrc(cardId);
        Assertions.assertNotNull(cardLinks);
        Assertions.assertEquals(0, cardLinks.size());

        cardContentLinks = client.cardContentRestEndpoint.getStickyNoteLinksAsSrc(cardContentId);
        Assertions.assertNotNull(cardContentLinks);
        Assertions.assertEquals(1, cardContentLinks.size());
        Assertions.assertEquals(linkId, cardContentLinks.get(0).getId());
    }

    @Test
    public void testChangeStickyNoteLinkSrcCardContent() {
        Project project = ColabFactory.createProject(client,
            "testChangeStickyNoteLinkSrcCardContent");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long cardContentId = ColabFactory.getCardContent(client, cardId).getId();

        StickyNoteLink link = new StickyNoteLink();
        link.setSrcCardContentId(cardContentId);
        link.setDestinationCardId(workCardId);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(link);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertNull(persistedLink.getSrcCardId());
        Assertions.assertEquals(cardContentId, persistedLink.getSrcCardContentId());
        Assertions.assertNull(persistedLink.getSrcResourceOrRefId());
        Assertions.assertNull(persistedLink.getSrcBlockId());

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
        Assertions.assertNull(persistedLink.getSrcBlockId());

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
    public void testChangeStickyNoteLinkSrcResource() {
        Project project = ColabFactory.createProject(client,
            "testChangeStickyNoteLinkSrcResource");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long resourceId = ColabFactory.createCardResource(client, cardId, "soft cakes").getId();

        Resource resource = (Resource) client.resourceRestEndpoint.getAbstractResource(resourceId);
        Block block = client.blockRestEndPoint.createNewTextDataBlock(resource.getDocumentId());
        Long blockId = block.getId();

        StickyNoteLink link = new StickyNoteLink();
        link.setSrcResourceOrRefId(resourceId);
        link.setDestinationCardId(workCardId);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(link);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertNull(persistedLink.getSrcCardId());
        Assertions.assertNull(persistedLink.getSrcCardContentId());
        Assertions.assertEquals(resourceId, persistedLink.getSrcResourceOrRefId());
        Assertions.assertNull(persistedLink.getSrcBlockId());

        List<StickyNoteLink> resourceLinks = client.resourceRestEndpoint
            .getStickyNoteLinksAsSrc(resourceId);
        Assertions.assertNotNull(resourceLinks);
        Assertions.assertEquals(1, resourceLinks.size());
        Assertions.assertEquals(linkId, resourceLinks.get(0).getId());

        List<StickyNoteLink> blockLinks = client.blockRestEndPoint.getStickyNoteLinksAsSrc(blockId);
        Assertions.assertNotNull(blockLinks);
        Assertions.assertEquals(0, blockLinks.size());

        client.stickyNoteLinkRestEndpoint.changeSrcWithBlock(persistedLink.getId(), blockId);

        persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertNull(persistedLink.getSrcCardId());
        Assertions.assertNull(persistedLink.getSrcCardContentId());
        Assertions.assertNull(persistedLink.getSrcResourceOrRefId());
        Assertions.assertEquals(blockId, persistedLink.getSrcBlockId());

        resourceLinks = client.resourceRestEndpoint.getStickyNoteLinksAsSrc(resourceId);
        Assertions.assertNotNull(resourceLinks);
        Assertions.assertEquals(0, resourceLinks.size());

        blockLinks = client.blockRestEndPoint.getStickyNoteLinksAsSrc(blockId);
        Assertions.assertNotNull(blockLinks);
        Assertions.assertEquals(1, blockLinks.size());
        Assertions.assertEquals(linkId, blockLinks.get(0).getId());
    }

    @Test
    public void testChangeStickyNoteLinkSrcBlock() {
        Project project = ColabFactory.createProject(client, "testChangeStickyNoteLinkSrcBlock");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long resourceId = ColabFactory.createCardResource(client, cardId, "soft cakes").getId();

        Resource resource = (Resource) client.resourceRestEndpoint.getAbstractResource(resourceId);
        Block block = client.blockRestEndPoint.createNewTextDataBlock(resource.getDocumentId());
        Long blockId = block.getId();

        StickyNoteLink link = new StickyNoteLink();
        link.setSrcBlockId(blockId);
        link.setDestinationCardId(workCardId);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(link);

        StickyNoteLink persistedLink = client.stickyNoteLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertNull(persistedLink.getSrcCardId());
        Assertions.assertNull(persistedLink.getSrcCardContentId());
        Assertions.assertNull(persistedLink.getSrcResourceOrRefId());
        Assertions.assertEquals(blockId, persistedLink.getSrcBlockId());

        List<StickyNoteLink> blockLinks = client.blockRestEndPoint.getStickyNoteLinksAsSrc(blockId);
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
        Assertions.assertNull(persistedLink.getSrcBlockId());

        blockLinks = client.blockRestEndPoint.getStickyNoteLinksAsSrc(blockId);
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

        StickyNoteLink link = new StickyNoteLink();
        link.setSrcCardId(cardId);
        link.setDestinationCardId(workCardId);

        Long linkId = client.stickyNoteLinkRestEndpoint.createLink(link);

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
