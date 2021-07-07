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
    public void testCreateStickyNoteLinkFromCard() {
        String teaser = "remember me #" + ((int) (Math.random() * 1000));
        String explanation = "This resource explains exactly how to do a nice report #"
            + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client, "testCreateStickyNoteLinkFromCard");

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
    public void testCreateStickyNoteLinkFromCardContent() {
        String teaser = "remember me #" + ((int) (Math.random() * 1000));
        String explanation = "This resource explains exactly how to do a nice report #"
            + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client,
            "testCreateStickyNoteLinkFromCardContent");

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
    public void testCreateStickyNoteLinkFromResource() {
        String teaser = "remember me #" + ((int) (Math.random() * 1000));
        String explanation = "This resource explains exactly how to do a nice report #"
            + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client,
            "testCreateStickyNoteLinkFromResource");

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
    public void testCreateStickyNoteLinkFromResourceReference() {
        String teaser = "remember me #" + ((int) (Math.random() * 1000));
        String explanation = "This resource explains exactly how to do a nice report #"
            + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client,
            "testCreateStickyNoteLinkFromResource");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long cardContentId = ColabFactory.getCardContent(client, cardId).getId();

        ColabFactory.createCardResource(client, cardId, "soft cakes").getId();

        List<AbstractResource> resourceRefs = client.cardContentRestEndpoint
            .getDirectAbstractResourcesOfCardContent(cardContentId);
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
    public void testCreateStickyNoteLinkFromBlock() {
        String teaser = "remember me #" + ((int) (Math.random() * 1000));
        String explanation = "This resource explains exactly how to do a nice report #"
            + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client, "testCreateStickyNoteLinkFromBlock");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long resourceId = ColabFactory.createCardResource(client, cardId, "soft cakes").getId();

        Resource resource = client.resourceRestEndpoint.getResource(resourceId);
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
        Project project = ColabFactory.createProject(client, "testCreateStickyNoteLinkFromCard");

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
        Project project = ColabFactory.createProject(client, "testCreateStickyNoteLinkFromCard");

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
    public void testChangeStickyNoteLinkFromCard() {
        Project project = ColabFactory.createProject(client, "testChangeStickyNoteLinkFromCard");

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
    public void testChangeStickyNoteLinkFromCardContent() {
        Project project = ColabFactory.createProject(client,
            "testChangeStickyNoteLinkFromCardContent");

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
    public void testChangeStickyNoteLinkFromResource() {
        Project project = ColabFactory.createProject(client,
            "testChangeStickyNoteLinkFromResource");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long resourceId = ColabFactory.createCardResource(client, cardId, "soft cakes").getId();

        Resource resource = client.resourceRestEndpoint.getResource(resourceId);
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
    public void testChangeStickyNoteLinkFromBlock() {
        Project project = ColabFactory.createProject(client, "testChangeStickyNoteLinkFromBlock");

        Long workCardId = ColabFactory.createNewCard(client, project).getId();

        Long cardId = ColabFactory.createNewCard(client, project).getId();

        Long resourceId = ColabFactory.createCardResource(client, cardId, "soft cakes").getId();

        Resource resource = client.resourceRestEndpoint.getResource(resourceId);
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

}
