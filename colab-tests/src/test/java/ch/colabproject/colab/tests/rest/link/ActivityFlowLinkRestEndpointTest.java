/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.link;

import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of activity flow link rest end point from a client point of view
 *
 * @author sandra
 */
public class ActivityFlowLinkRestEndpointTest extends AbstractArquillianTest {

    @Test
    public void testCreateActivityFlowLink() {
        Project project = ColabFactory.createProject(client, "testCreateActivityFlowLink");

        Long nextCardId = ColabFactory.createNewCard(client, project).getId();

        Long previousCardId = ColabFactory.createNewCard(client, project).getId();

        ActivityFlowLink link = new ActivityFlowLink();
        link.setPreviousCardId(previousCardId);
        link.setNextCardId(nextCardId);

        Long linkId = client.activityFlowLinkRestEndpoint.createLink(link);

        ActivityFlowLink persistedLink = client.activityFlowLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(previousCardId, persistedLink.getPreviousCardId());
        Assertions.assertEquals(nextCardId, persistedLink.getNextCardId());

        List<ActivityFlowLink> previousCardLinks = client.cardRestEndpoint
            .getActivityFlowLinksAsPrevious(previousCardId);
        Assertions.assertNotNull(previousCardLinks);
        Assertions.assertEquals(1, previousCardLinks.size());
        Assertions.assertEquals(linkId, previousCardLinks.get(0).getId());

        List<ActivityFlowLink> nextCardLinks = client.cardRestEndpoint
            .getActivityFlowLinksAsNext(nextCardId);
        Assertions.assertNotNull(nextCardLinks);
        Assertions.assertEquals(1, nextCardLinks.size());
        Assertions.assertEquals(linkId, nextCardLinks.get(0).getId());
    }

//    @Test
//    public void testUpdateActivityFlowLink() {
//        Project project = ColabFactory.createProject(client, "testUpdateActivityFlowLink");
//
//        Long nextCardId = ColabFactory.createNewCard(client, project).getId();
//
//        Long previousCardId = ColabFactory.createNewCard(client, project).getId();
//
//        ActivityFlowLink link = new ActivityFlowLink();
//        link.setPreviousCardId(previousCardId);
//        link.setNextCardId(nextCardId);
//
//        Long linkId = client.activityFlowLinkRestEndpoint.createLink(link);
//
//        link = client.activityFlowLinkRestEndpoint.getLink(linkId);
//        Assertions.assertNotNull(link);
//
//        client.activityFlowLinkRestEndpoint.updateLink(link);
//
//        ActivityFlowLink persistedLink = client.activityFlowLinkRestEndpoint.getLink(linkId);
//        Assertions.assertNotNull(persistedLink);
//    }

    @Test
    public void testDeleteActivityFlowLink() {
        Project project = ColabFactory.createProject(client, "testDeleteActivityFlowLink");

        Long nextCardId = ColabFactory.createNewCard(client, project).getId();

        Long previousCardId = ColabFactory.createNewCard(client, project).getId();

        ActivityFlowLink link = new ActivityFlowLink();
        link.setPreviousCardId(previousCardId);
        link.setNextCardId(nextCardId);

        Long linkId = client.activityFlowLinkRestEndpoint.createLink(link);

        ActivityFlowLink persistedLink = client.activityFlowLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(previousCardId, persistedLink.getPreviousCardId());
        Assertions.assertEquals(nextCardId, persistedLink.getNextCardId());

        List<ActivityFlowLink> previousCardLinks = client.cardRestEndpoint
            .getActivityFlowLinksAsPrevious(previousCardId);
        Assertions.assertNotNull(previousCardLinks);
        Assertions.assertEquals(1, previousCardLinks.size());
        Assertions.assertEquals(linkId, previousCardLinks.get(0).getId());

        List<ActivityFlowLink> nextCardLinks = client.cardRestEndpoint
            .getActivityFlowLinksAsNext(nextCardId);
        Assertions.assertNotNull(nextCardLinks);
        Assertions.assertEquals(1, nextCardLinks.size());
        Assertions.assertEquals(linkId, nextCardLinks.get(0).getId());

        client.activityFlowLinkRestEndpoint.deleteLink(linkId);

        persistedLink = client.activityFlowLinkRestEndpoint.getLink(linkId);
        Assertions.assertNull(persistedLink);

        previousCardLinks = client.cardRestEndpoint.getActivityFlowLinksAsPrevious(previousCardId);
        Assertions.assertNotNull(previousCardLinks);
        Assertions.assertEquals(0, previousCardLinks.size());

        nextCardLinks = client.cardRestEndpoint.getActivityFlowLinksAsNext(nextCardId);
        Assertions.assertNotNull(nextCardLinks);
        Assertions.assertEquals(0, nextCardLinks.size());
    }

    @Test
    public void testActivityFlowLinkValidation() {
        Project project = ColabFactory.createProject(client, "testActivityFlowLinkValidation");

        Long theCardId = ColabFactory.createNewCard(client, project).getId();

        ActivityFlowLink link = new ActivityFlowLink();
        link.setPreviousCardId(theCardId);
        link.setNextCardId(theCardId);

        try {
            client.activityFlowLinkRestEndpoint.createLink(link);
        } catch (HttpErrorMessage hem) {
            Assertions.assertEquals(HttpErrorMessage.MessageCode.DATA_INTEGRITY_FAILURE,
                hem.getMessageCode());
            return;
        }

        Assertions.fail();
    }

    @Test
    public void testChangeActivityFlowLinkPreviousCard() {
        Project project = ColabFactory.createProject(client,
            "testChangeActivityFlowLinkPreviousCard");

        Long nextCardId = ColabFactory.createNewCard(client, project).getId();

        Long previousCardId = ColabFactory.createNewCard(client, project).getId();

        ActivityFlowLink link = new ActivityFlowLink();
        link.setPreviousCardId(previousCardId);
        link.setNextCardId(nextCardId);

        Long linkId = client.activityFlowLinkRestEndpoint.createLink(link);

        ActivityFlowLink persistedLink = client.activityFlowLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(previousCardId, persistedLink.getPreviousCardId());
        Assertions.assertEquals(nextCardId, persistedLink.getNextCardId());

        List<ActivityFlowLink> previousCardLinks = client.cardRestEndpoint
            .getActivityFlowLinksAsPrevious(previousCardId);
        Assertions.assertNotNull(previousCardLinks);
        Assertions.assertEquals(1, previousCardLinks.size());
        Assertions.assertEquals(linkId, previousCardLinks.get(0).getId());

        List<ActivityFlowLink> nextCardLinks = client.cardRestEndpoint
            .getActivityFlowLinksAsNext(nextCardId);
        Assertions.assertNotNull(nextCardLinks);
        Assertions.assertEquals(1, nextCardLinks.size());
        Assertions.assertEquals(linkId, nextCardLinks.get(0).getId());

        Long anotherCardId = ColabFactory.createNewCard(client, project).getId();

        client.activityFlowLinkRestEndpoint.changePreviousCard(persistedLink.getId(),
            anotherCardId);

        persistedLink = client.activityFlowLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(anotherCardId, persistedLink.getPreviousCardId());

        List<ActivityFlowLink> anotherCardLinks = client.cardRestEndpoint
            .getActivityFlowLinksAsPrevious(anotherCardId);
        Assertions.assertNotNull(anotherCardLinks);
        Assertions.assertEquals(1, anotherCardLinks.size());
        Assertions.assertEquals(linkId, anotherCardLinks.get(0).getId());

        nextCardLinks = client.cardRestEndpoint.getActivityFlowLinksAsNext(nextCardId);
        Assertions.assertNotNull(nextCardLinks);
        Assertions.assertEquals(1, nextCardLinks.size());
        Assertions.assertEquals(linkId, nextCardLinks.get(0).getId());

        previousCardLinks = client.cardRestEndpoint
            .getActivityFlowLinksAsPrevious(previousCardId);
        Assertions.assertNotNull(previousCardLinks);
        Assertions.assertEquals(0, previousCardLinks.size());
    }

    @Test
    public void testChangeActivityFlowLinkNextCard() {
        Project project = ColabFactory.createProject(client,
            "testChangeActivityFlowLinkNextCard");

        Long nextCardId = ColabFactory.createNewCard(client, project).getId();

        Long previousCardId = ColabFactory.createNewCard(client, project).getId();

        ActivityFlowLink link = new ActivityFlowLink();
        link.setPreviousCardId(previousCardId);
        link.setNextCardId(nextCardId);

        Long linkId = client.activityFlowLinkRestEndpoint.createLink(link);

        ActivityFlowLink persistedLink = client.activityFlowLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(previousCardId, persistedLink.getPreviousCardId());
        Assertions.assertEquals(nextCardId, persistedLink.getNextCardId());

        List<ActivityFlowLink> previousCardLinks = client.cardRestEndpoint
            .getActivityFlowLinksAsPrevious(previousCardId);
        Assertions.assertNotNull(previousCardLinks);
        Assertions.assertEquals(1, previousCardLinks.size());
        Assertions.assertEquals(linkId, previousCardLinks.get(0).getId());

        List<ActivityFlowLink> nextCardLinks = client.cardRestEndpoint
            .getActivityFlowLinksAsNext(nextCardId);
        Assertions.assertNotNull(nextCardLinks);
        Assertions.assertEquals(1, nextCardLinks.size());
        Assertions.assertEquals(linkId, nextCardLinks.get(0).getId());

        Long anotherWorkCardId = ColabFactory.createNewCard(client, project).getId();

        client.activityFlowLinkRestEndpoint.changeNextCard(persistedLink.getId(),
            anotherWorkCardId);

        persistedLink = client.activityFlowLinkRestEndpoint.getLink(linkId);
        Assertions.assertNotNull(persistedLink);
        Assertions.assertEquals(anotherWorkCardId, persistedLink.getNextCardId());

        previousCardLinks = client.cardRestEndpoint.getActivityFlowLinksAsPrevious(previousCardId);
        Assertions.assertNotNull(previousCardLinks);
        Assertions.assertEquals(1, previousCardLinks.size());
        Assertions.assertEquals(linkId, previousCardLinks.get(0).getId());

        List<ActivityFlowLink> otherCardLinks = client.cardRestEndpoint
            .getActivityFlowLinksAsNext(anotherWorkCardId);
        Assertions.assertNotNull(otherCardLinks);
        Assertions.assertEquals(1, otherCardLinks.size());
        Assertions.assertEquals(linkId, otherCardLinks.get(0).getId());

        nextCardLinks = client.cardRestEndpoint.getActivityFlowLinksAsNext(nextCardId);
        Assertions.assertNotNull(nextCardLinks);
        Assertions.assertEquals(0, nextCardLinks.size());
    }

}
