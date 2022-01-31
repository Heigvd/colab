/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.team;

import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.card.CardTypeRef;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.team.acl.InvolvementLevel;
import ch.colabproject.colab.client.ColabClient;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage.MessageCode;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import ch.colabproject.colab.tests.tests.SampleTestData;
import ch.colabproject.colab.tests.tests.TestUser;
import ch.colabproject.colab.tests.ws.WebsocketClient;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of the team rest end point from a client point of view
 *
 * @author sandra
 */
public class AccessControlTest extends AbstractArquillianTest {

    private SampleTestData data;

    private ColabClient aclTestClient;

    private Long aclTestUserId;

    @Test
    public void testSeveralAccesses() throws Exception {
        data = new SampleTestData(client);

        // create a new user
        TestUser aclTestUser = this.signup(
            "testACL",
            "testacl@test.local",
            "t3stACL43v3r");
        aclTestClient = this.createRestClient();

        this.signIn(aclTestClient, aclTestUser);
        WebsocketClient guestWsClient = this.createWsClient();
        aclTestClient.websocketRestEndpoint
            .subscribeToBroadcastChannel(guestWsClient.getSessionId());
        aclTestClient.websocketRestEndpoint.subscribeToUserChannel(guestWsClient.getSessionId());

        aclTestUserId = aclTestClient.userRestEndpoint.getCurrentUser().getId();

        // no access
        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadWriteAccess());
        Assertions.assertTrue(hasPublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasPublishedGlobalCardTypeReadWriteAccess());

        Assertions.assertFalse(hasProjectReadAccess());
        Assertions.assertFalse(hasProjectReadWriteAccess());
        Assertions.assertFalse(hasCardReadAccess());
        Assertions.assertFalse(hasCardReadWriteAccess());
        Assertions.assertFalse(hasCardContentReadAccess());
        Assertions.assertFalse(hasCardContentReadWriteAccess());

        Assertions.assertFalse(hasGlobalCardTypeRefReadAccess());
        Assertions.assertFalse(hasGlobalCardTypeRefReadWriteAccess());

        Assertions.assertFalse(hasLocalCardTypeReadAccess());
        Assertions.assertFalse(hasLocalCardTypeReadWriteAccess());

        Assertions.assertFalse(hasFriendCardTypeReadAccess());
        Assertions.assertFalse(hasFriendCardTypeReadWriteAccess());
        Assertions.assertFalse(hasFriendCardTypeRefReadAccess());
        Assertions.assertFalse(hasFriendCardTypeRefReadWriteAccess());

        Assertions.assertFalse(hasFriendProjectReadAccess());
        Assertions.assertFalse(hasFriendProjectReadWriteAccess());
        Assertions.assertFalse(hasAnotherProjectReadAccess());
        Assertions.assertFalse(hasAnotherProjectReadWriteAccess());

//        Assertions.assertFalse(hasDeliverableDocumentReadAccess());
//        Assertions.assertFalse(hasDeliverableDocumentReadWriteAccess());
//        Assertions.assertFalse(hasDeliverableBlockReadAccess());
//        Assertions.assertFalse(hasDeliverableBlockReadWriteAccess());

//        Assertions.assertTrue(hasGlobalResourceReadAccess());
//        Assertions.assertFalse(hasGlobalResourceReadWriteAccess());
        // TODO ResourceRef
//        Assertions.assertFalse(hasLocalResourceReadAccess());
//        Assertions.assertFalse(hasLocalResourceReadWriteAccess());
//        Assertions.assertFalse(hasDocumentReadAccess());
//        Assertions.assertFalse(hasDocumentReadWriteAccess());
//        Assertions.assertFalse(hasBlockReadAccess());
//        Assertions.assertFalse(hasBlockReadWriteAccess());
//        Assertions.assertFalse(hasActivityFlowLinkReadAccess());
//        Assertions.assertFalse(hasActivityFlowLinkReadWriteAccess());
//        Assertions.assertFalse(hasStickyNoteLinkReadAccess());
//        Assertions.assertFalse(hasStickyNoteLinkReadWriteAccess());
//      Assertions.assertFalse(hasTeamMemberReadAccess());
//      Assertions.assertFalse(hasTeamMemberReadWriteAccess());
//      Assertions.assertFalse(hasTeamRoleReadAccess());
//      Assertions.assertFalse(hasTeamRoleReadWriteAccess());

        // as admin, we can reach everything
        client.userRestEndpoint.grantAdminRight(aclTestUserId);

        Assertions.assertTrue(hasUnpublishedGlobalCardTypeReadAccess());
        Assertions.assertTrue(hasUnpublishedGlobalCardTypeReadWriteAccess());
        Assertions.assertTrue(hasPublishedGlobalCardTypeReadAccess());
        Assertions.assertTrue(hasPublishedGlobalCardTypeReadWriteAccess());

        Assertions.assertTrue(hasProjectReadAccess());
        Assertions.assertTrue(hasProjectReadWriteAccess());
        Assertions.assertTrue(hasCardReadAccess());
        Assertions.assertTrue(hasCardReadWriteAccess());
        Assertions.assertTrue(hasCardContentReadAccess());
        Assertions.assertTrue(hasCardContentReadWriteAccess());

        Assertions.assertTrue(hasGlobalCardTypeRefReadAccess());
        Assertions.assertTrue(hasGlobalCardTypeRefReadWriteAccess());

        Assertions.assertTrue(hasLocalCardTypeReadAccess());
        Assertions.assertTrue(hasLocalCardTypeReadWriteAccess());

        Assertions.assertTrue(hasFriendCardTypeReadAccess());
        Assertions.assertTrue(hasFriendCardTypeReadWriteAccess());
        Assertions.assertTrue(hasFriendCardTypeRefReadAccess());
        Assertions.assertTrue(hasFriendCardTypeRefReadWriteAccess());

        Assertions.assertTrue(hasFriendProjectReadAccess());
        Assertions.assertTrue(hasFriendProjectReadWriteAccess());
        Assertions.assertTrue(hasAnotherProjectReadAccess());
        Assertions.assertTrue(hasAnotherProjectReadWriteAccess());

//        Assertions.assertTrue(hasDeliverableDocumentReadAccess());
//        Assertions.assertTrue(hasDeliverableDocumentReadWriteAccess());
//        Assertions.assertTrue(hasDeliverableBlockReadAccess());
//        Assertions.assertTrue(hasDeliverableBlockReadWriteAccess());

//        Assertions.assertTrue(hasLocalResourceReadAccess());
//        Assertions.assertTrue(hasLocalResourceReadWriteAccess());
//        Assertions.assertTrue(hasGlobalResourceReadAccess());
//        Assertions.assertTrue(hasGlobalResourceReadWriteAccess());
//        Assertions.assertTrue(hasDocumentReadAccess());
//        Assertions.assertTrue(hasDocumentReadWriteAccess());
//        Assertions.assertTrue(hasBlockReadAccess());
//        Assertions.assertTrue(hasBlockReadWriteAccess());
//        Assertions.assertTrue(hasActivityFlowLinkReadAccess());
//        Assertions.assertTrue(hasActivityFlowLinkReadWriteAccess());
//        Assertions.assertTrue(hasStickyNoteLinkReadAccess());
//        Assertions.assertTrue(hasStickyNoteLinkReadWriteAccess());
//      Assertions.assertTrue(hasTeamMemberReadAccess());
//      Assertions.assertTrue(hasTeamMemberReadWriteAccess());
//      Assertions.assertTrue(hasTeamRoleReadAccess());
//      Assertions.assertTrue(hasTeamRoleReadWriteAccess());

        // no more admin, no more access
        client.userRestEndpoint.revokeAdminRight(aclTestUserId);

        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadWriteAccess());
        Assertions.assertTrue(hasPublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasPublishedGlobalCardTypeReadWriteAccess());

        Assertions.assertFalse(hasProjectReadAccess());
        Assertions.assertFalse(hasProjectReadWriteAccess());
        Assertions.assertFalse(hasCardReadAccess());
        Assertions.assertFalse(hasCardReadWriteAccess());
        Assertions.assertFalse(hasCardContentReadAccess());
        Assertions.assertFalse(hasCardContentReadWriteAccess());

        Assertions.assertFalse(hasGlobalCardTypeRefReadAccess());
        Assertions.assertFalse(hasGlobalCardTypeRefReadWriteAccess());

        Assertions.assertFalse(hasLocalCardTypeReadAccess());
        Assertions.assertFalse(hasLocalCardTypeReadWriteAccess());

        Assertions.assertFalse(hasFriendCardTypeReadAccess());
        Assertions.assertFalse(hasFriendCardTypeReadWriteAccess());
        Assertions.assertFalse(hasFriendCardTypeRefReadAccess());
        Assertions.assertFalse(hasFriendCardTypeRefReadWriteAccess());

        Assertions.assertFalse(hasFriendProjectReadAccess());
        Assertions.assertFalse(hasFriendProjectReadWriteAccess());
        Assertions.assertFalse(hasAnotherProjectReadAccess());
        Assertions.assertFalse(hasAnotherProjectReadWriteAccess());

//        Assertions.assertFalse(hasDeliverableDocumentReadAccess());
//        Assertions.assertFalse(hasDeliverableDocumentReadWriteAccess());
//        Assertions.assertFalse(hasDeliverableBlockReadAccess());
//        Assertions.assertFalse(hasDeliverableBlockReadWriteAccess());

//        Assertions.assertFalse(hasLocalResourceReadAccess());
//        Assertions.assertFalse(hasLocalResourceReadWriteAccess());
//        Assertions.assertTrue(hasGlobalResourceReadAccess());
//        Assertions.assertFalse(hasGlobalResourceReadWriteAccess());
//        Assertions.assertFalse(hasDocumentReadAccess());
//        Assertions.assertFalse(hasDocumentReadWriteAccess());
//        Assertions.assertFalse(hasBlockReadAccess());
//        Assertions.assertFalse(hasBlockReadWriteAccess());
//        Assertions.assertFalse(hasActivityFlowLinkReadAccess());
//        Assertions.assertFalse(hasActivityFlowLinkReadWriteAccess());
//        Assertions.assertFalse(hasStickyNoteLinkReadAccess());
//        Assertions.assertFalse(hasStickyNoteLinkReadWriteAccess());
//      Assertions.assertFalse(hasTeamMemberReadAccess());
//      Assertions.assertFalse(hasTeamMemberReadWriteAccess());
//      Assertions.assertFalse(hasTeamRoleReadAccess());
//      Assertions.assertFalse(hasTeamRoleReadWriteAccess());

        // invite the user to the project
        // now read and write accesses to the project
        Project project = client.projectRestEndpoint.getProject(data.getProjectId());
        Long aclTestTeamMemberId = ColabFactory.inviteAndJoin(client, project,
            "testacl@test.local", aclTestClient, mailClient).getId();

        aclTestClient.websocketRestEndpoint.subscribeToProjectChannel(data.getProjectId(),
            guestWsClient.getSessionId());

        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadWriteAccess());
        Assertions.assertTrue(hasPublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasPublishedGlobalCardTypeReadWriteAccess());

        Assertions.assertTrue(hasProjectReadAccess());
        Assertions.assertTrue(hasProjectReadWriteAccess());
        Assertions.assertTrue(hasCardReadAccess());
        Assertions.assertTrue(hasCardReadWriteAccess());
        Assertions.assertTrue(hasCardContentReadAccess());
        Assertions.assertTrue(hasCardContentReadWriteAccess());

        Assertions.assertTrue(hasGlobalCardTypeRefReadAccess());
        Assertions.assertTrue(hasGlobalCardTypeRefReadWriteAccess());

        Assertions.assertTrue(hasLocalCardTypeReadAccess());
        Assertions.assertTrue(hasLocalCardTypeReadWriteAccess());

//        Assertions.assertTrue(hasFriendCardTypeReadAccess());
//        Assertions.assertFalse(hasFriendCardTypeReadWriteAccess());
//        Assertions.assertTrue(hasFriendCardTypeRefReadAccess());
//        Assertions.assertTrue(hasFriendCardTypeRefReadWriteAccess());
//
//        Assertions.assertTrue(hasFriendProjectReadAccess());
//        Assertions.assertFalse(hasFriendProjectReadWriteAccess());
//        Assertions.assertFalse(hasAnotherProjectReadAccess());
//        Assertions.assertFalse(hasAnotherProjectReadWriteAccess());

//        Assertions.assertTrue(hasDeliverableDocumentReadAccess());
//        Assertions.assertTrue(hasDeliverableDocumentReadWriteAccess());
//        Assertions.assertTrue(hasDeliverableBlockReadAccess());
//        Assertions.assertTrue(hasDeliverableBlockReadWriteAccess());

//        Assertions.assertTrue(hasLocalResourceReadAccess());
//        Assertions.assertTrue(hasLocalResourceReadWriteAccess());
//        Assertions.assertTrue(hasGlobalResourceReadAccess());
//        Assertions.assertFalse(hasGlobalResourceReadWriteAccess());
//        Assertions.assertTrue(hasDocumentReadAccess());
//        Assertions.assertTrue(hasDocumentReadWriteAccess());
//        Assertions.assertTrue(hasBlockReadAccess());
//        Assertions.assertTrue(hasBlockReadWriteAccess());
//        Assertions.assertTrue(hasActivityFlowLinkReadAccess());
//        Assertions.assertTrue(hasActivityFlowLinkReadWriteAccess());
//        Assertions.assertTrue(hasStickyNoteLinkReadAccess());
//        Assertions.assertTrue(hasStickyNoteLinkReadWriteAccess());
//      Assertions.assertTrue(hasTeamMemberReadAccess());
//      Assertions.assertTrue(hasTeamMemberReadWriteAccess());
//      Assertions.assertTrue(hasTeamRoleReadAccess());
//      Assertions.assertTrue(hasTeamRoleReadWriteAccess());

        // if the hierarchical position is extern, no access to detail
        client.teamRestEndpoint.changeMemberPosition(aclTestTeamMemberId,
            HierarchicalPosition.EXTERN);

        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadWriteAccess());
        Assertions.assertTrue(hasPublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasPublishedGlobalCardTypeReadWriteAccess());

        Assertions.assertTrue(hasProjectReadAccess());
        Assertions.assertFalse(hasProjectReadWriteAccess());
        Assertions.assertTrue(hasCardReadAccess());
        Assertions.assertFalse(hasCardReadWriteAccess());
        Assertions.assertTrue(hasCardContentReadAccess());
        Assertions.assertFalse(hasCardContentReadWriteAccess());

        Assertions.assertTrue(hasGlobalCardTypeRefReadAccess());
        Assertions.assertFalse(hasGlobalCardTypeRefReadWriteAccess());

        Assertions.assertTrue(hasLocalCardTypeReadAccess());
        Assertions.assertFalse(hasLocalCardTypeReadWriteAccess());

//        Assertions.assertTrue(hasFriendCardTypeReadAccess());
//        Assertions.assertFalse(hasFriendCardTypeReadWriteAccess());
//        Assertions.assertTrue(hasFriendCardTypeRefReadAccess());
//        Assertions.assertFalse(hasFriendCardTypeRefReadWriteAccess());
//
//        Assertions.assertTrue(hasFriendProjectReadAccess());
//        Assertions.assertFalse(hasFriendProjectReadWriteAccess());
//        Assertions.assertFalse(hasAnotherProjectReadAccess());
//        Assertions.assertFalse(hasAnotherProjectReadWriteAccess());

//        Assertions.assertFalse(hasDeliverableDocumentReadAccess());
//        Assertions.assertFalse(hasDeliverableDocumentReadWriteAccess());
//        Assertions.assertFalse(hasDeliverableBlockReadAccess());
//        Assertions.assertFalse(hasDeliverableBlockReadWriteAccess());

//        Assertions.assertFalse(hasLocalResourceReadAccess());
//        Assertions.assertFalse(hasLocalResourceReadWriteAccess());
//        Assertions.assertFalse(hasGlobalResourceReadAccess());
//        Assertions.assertFalse(hasGlobalResourceReadWriteAccess());
//        Assertions.assertFalse(hasDocumentReadAccess());
//        Assertions.assertFalse(hasDocumentReadWriteAccess());
//        Assertions.assertFalse(hasBlockReadAccess());
//        Assertions.assertFalse(hasBlockReadWriteAccess());
//        Assertions.assertFalse(hasActivityFlowLinkReadAccess());
//        Assertions.assertFalse(hasActivityFlowLinkReadWriteAccess());
//        Assertions.assertFalse(hasStickyNoteLinkReadAccess());
//        Assertions.assertFalse(hasStickyNoteLinkReadWriteAccess());
//      Assertions.assertTrue(hasTeamMemberReadAccess());
//      Assertions.assertFalse(hasTeamMemberReadWriteAccess());
//      Assertions.assertTrue(hasTeamRoleReadAccess());
//      Assertions.assertFalse(hasTeamRoleReadWriteAccess());

        // Extern with Informed read only
        Card card = client.cardRestEndpoint.getCard(data.getCardId());
        card.setDefaultInvolvementLevel(InvolvementLevel.INFORMED_READONLY);
        client.cardRestEndpoint.updateCard(card);

        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadWriteAccess());
        Assertions.assertTrue(hasPublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasPublishedGlobalCardTypeReadWriteAccess());

        Assertions.assertTrue(hasProjectReadAccess());
        Assertions.assertFalse(hasProjectReadWriteAccess());
        Assertions.assertTrue(hasCardReadAccess());
        Assertions.assertFalse(hasCardReadWriteAccess());
        Assertions.assertTrue(hasCardContentReadAccess());
        Assertions.assertFalse(hasCardContentReadWriteAccess());

        Assertions.assertTrue(hasGlobalCardTypeRefReadAccess());
        Assertions.assertFalse(hasGlobalCardTypeRefReadWriteAccess());

        Assertions.assertTrue(hasLocalCardTypeReadAccess());
        Assertions.assertFalse(hasLocalCardTypeReadWriteAccess());

//        Assertions.assertTrue(hasFriendCardTypeReadAccess());
//        Assertions.assertFalse(hasFriendCardTypeReadWriteAccess());
//        Assertions.assertTrue(hasFriendCardTypeRefReadAccess());
//        Assertions.assertFalse(hasFriendCardTypeRefReadWriteAccess());
//
//        Assertions.assertTrue(hasFriendProjectReadAccess());
//        Assertions.assertFalse(hasFriendProjectReadWriteAccess());
//        Assertions.assertFalse(hasAnotherProjectReadAccess());
//        Assertions.assertFalse(hasAnotherProjectReadWriteAccess());

//        Assertions.assertTrue(hasDeliverableDocumentReadAccess());
//        //Assertions.assertFalse(hasDeliverableDocumentReadWriteAccess());
//        Assertions.assertTrue(hasDeliverableBlockReadAccess());
//        Assertions.assertFalse(hasDeliverableBlockReadWriteAccess());

//        Assertions.assertTrue(hasLocalResourceReadAccess());
//        Assertions.assertFalse(hasLocalResourceReadWriteAccess());
//        Assertions.assertTrue(hasGlobalResourceReadAccess());
//        Assertions.assertFalse(hasGlobalResourceReadWriteAccess());
//        Assertions.assertTrue(hasDocumentReadAccess());
//        Assertions.assertFalse(hasDocumentReadWriteAccess());
//        Assertions.assertTrue(hasBlockReadAccess());
//        Assertions.assertFalse(hasBlockReadWriteAccess());
//        Assertions.assertTrue(hasActivityFlowLinkReadAccess());
//        Assertions.assertFalse(hasActivityFlowLinkReadWriteAccess());
//        Assertions.assertTrue(hasStickyNoteLinkReadAccess());
//        Assertions.assertFalse(hasStickyNoteLinkReadWriteAccess());
//      Assertions.assertTrue(hasTeamMemberReadAccess());
//      Assertions.assertFalse(hasTeamMemberReadWriteAccess());
//      Assertions.assertTrue(hasTeamRoleReadAccess());
//      Assertions.assertFalse(hasTeamRoleReadWriteAccess());

        // Extern with informed read write
        card = client.cardRestEndpoint.getCard(data.getCardId());
        card.setDefaultInvolvementLevel(InvolvementLevel.INFORMED_READWRITE);
        client.cardRestEndpoint.updateCard(card);

        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadWriteAccess());
        Assertions.assertTrue(hasPublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasPublishedGlobalCardTypeReadWriteAccess());

        Assertions.assertTrue(hasProjectReadAccess());
        Assertions.assertFalse(hasProjectReadWriteAccess());
        Assertions.assertTrue(hasCardReadAccess());
        Assertions.assertTrue(hasCardReadWriteAccess());
        Assertions.assertTrue(hasCardContentReadAccess());
        Assertions.assertTrue(hasCardContentReadWriteAccess());

        Assertions.assertTrue(hasGlobalCardTypeRefReadAccess());
        Assertions.assertFalse(hasGlobalCardTypeRefReadWriteAccess());

        Assertions.assertTrue(hasLocalCardTypeReadAccess());
        Assertions.assertFalse(hasLocalCardTypeReadWriteAccess());

//        Assertions.assertTrue(hasFriendCardTypeReadAccess());
//        Assertions.assertFalse(hasFriendCardTypeReadWriteAccess());
//        Assertions.assertTrue(hasFriendCardTypeRefReadAccess());
//        Assertions.assertFalse(hasFriendCardTypeRefReadWriteAccess());
//
//        Assertions.assertTrue(hasFriendProjectReadAccess());
//        Assertions.assertFalse(hasFriendProjectReadWriteAccess());
//        Assertions.assertFalse(hasAnotherProjectReadAccess());
//        Assertions.assertFalse(hasAnotherProjectReadWriteAccess());

//        Assertions.assertTrue(hasDeliverableDocumentReadAccess());
//        Assertions.assertTrue(hasDeliverableDocumentReadWriteAccess());
//        Assertions.assertTrue(hasDeliverableBlockReadAccess());
//        Assertions.assertTrue(hasDeliverableBlockReadWriteAccess());

//        Assertions.assertFalse(hasLocalResourceReadAccess());
//        Assertions.assertFalse(hasLocalResourceReadWriteAccess());
//        Assertions.assertTrue(hasGlobalResourceReadAccess());
//        Assertions.assertFalse(hasGlobalResourceReadWriteAccess());
//        Assertions.assertTrue(hasDocumentReadAccess());
//        Assertions.assertFalse(hasDocumentReadWriteAccess());
//        Assertions.assertTrue(hasBlockReadAccess());
//        Assertions.assertFalse(hasBlockReadWriteAccess());
//        Assertions.assertTrue(hasActivityFlowLinkReadAccess());
//        Assertions.assertTrue(hasActivityFlowLinkReadWriteAccess());
//        Assertions.assertTrue(hasStickyNoteLinkReadAccess());
//        Assertions.assertTrue(hasStickyNoteLinkReadWriteAccess());
//      Assertions.assertTrue(hasTeamMemberReadAccess());
//      Assertions.assertTrue(hasTeamMemberReadWriteAccess());
//      Assertions.assertTrue(hasTeamRoleReadAccess());
//      Assertions.assertTrue(hasTeamRoleReadWriteAccess());

        // Extern with out of the loop permissions
        card = client.cardRestEndpoint.getCard(data.getCardId());
        card.setDefaultInvolvementLevel(InvolvementLevel.OUT_OF_THE_LOOP);
        client.cardRestEndpoint.updateCard(card);

        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadWriteAccess());
        Assertions.assertTrue(hasPublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasPublishedGlobalCardTypeReadWriteAccess());

        Assertions.assertTrue(hasProjectReadAccess());
        Assertions.assertFalse(hasProjectReadWriteAccess());
        Assertions.assertTrue(hasCardReadAccess());
        Assertions.assertFalse(hasCardReadWriteAccess());
        Assertions.assertTrue(hasCardContentReadAccess());
        Assertions.assertFalse(hasCardContentReadWriteAccess());

        Assertions.assertTrue(hasGlobalCardTypeRefReadAccess());
        Assertions.assertFalse(hasGlobalCardTypeRefReadWriteAccess());

        Assertions.assertTrue(hasLocalCardTypeReadAccess());
        Assertions.assertFalse(hasLocalCardTypeReadWriteAccess());

//        Assertions.assertTrue(hasFriendCardTypeReadAccess());
//        Assertions.assertFalse(hasFriendCardTypeReadWriteAccess());
//        Assertions.assertTrue(hasFriendCardTypeRefReadAccess());
//        Assertions.assertFalse(hasFriendCardTypeRefReadWriteAccess());
//
//        Assertions.assertTrue(hasFriendProjectReadAccess());
//        Assertions.assertFalse(hasFriendProjectReadWriteAccess());
//        Assertions.assertFalse(hasAnotherProjectReadAccess());
//        Assertions.assertFalse(hasAnotherProjectReadWriteAccess());

//        Assertions.assertFalse(hasDeliverableDocumentReadAccess());
//        Assertions.assertFalse(hasDeliverableDocumentReadWriteAccess());
//        Assertions.assertFalse(hasDeliverableBlockReadAccess());
//        Assertions.assertFalse(hasDeliverableBlockReadWriteAccess());

//      Assertions.assertFalse(hasLocalResourceReadAccess());
//      Assertions.assertFalse(hasLocalResourceReadWriteAccess());
//      Assertions.assertFalse(hasGlobalResourceReadAccess());
//      Assertions.assertFalse(hasGlobalResourceReadWriteAccess());
//      Assertions.assertFalse(hasDocumentReadAccess());
//      Assertions.assertFalse(hasDocumentReadWriteAccess());
//      Assertions.assertFalse(hasBlockReadAccess());
//      Assertions.assertFalse(hasBlockReadWriteAccess());
//      Assertions.assertFalse(hasActivityFlowLinkReadAccess());
//      Assertions.assertFalse(hasActivityFlowLinkReadWriteAccess());
//      Assertions.assertFalse(hasStickyNoteLinkReadAccess());
//      Assertions.assertFalse(hasStickyNoteLinkReadWriteAccess());
//    Assertions.assertTrue(hasTeamMemberReadAccess());
//    Assertions.assertFalse(hasTeamMemberReadWriteAccess());
//    Assertions.assertTrue(hasTeamRoleReadAccess());
//    Assertions.assertFalse(hasTeamRoleReadWriteAccess());

        // if the hierarchical position is owner, full access
        client.teamRestEndpoint.changeMemberPosition(aclTestTeamMemberId,
            HierarchicalPosition.OWNER);

        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasUnpublishedGlobalCardTypeReadWriteAccess());
        Assertions.assertTrue(hasPublishedGlobalCardTypeReadAccess());
        Assertions.assertFalse(hasPublishedGlobalCardTypeReadWriteAccess());

        Assertions.assertTrue(hasProjectReadAccess());
        Assertions.assertTrue(hasProjectReadWriteAccess());
        Assertions.assertTrue(hasCardReadAccess());
        Assertions.assertTrue(hasCardReadWriteAccess());
        Assertions.assertTrue(hasCardContentReadAccess());
        Assertions.assertTrue(hasCardContentReadWriteAccess());

        Assertions.assertTrue(hasGlobalCardTypeRefReadAccess());
        Assertions.assertTrue(hasGlobalCardTypeRefReadWriteAccess());

        Assertions.assertTrue(hasLocalCardTypeReadAccess());
        Assertions.assertTrue(hasLocalCardTypeReadWriteAccess());

//        Assertions.assertTrue(hasFriendCardTypeReadAccess());
//        Assertions.assertFalse(hasFriendCardTypeReadWriteAccess());
//        Assertions.assertTrue(hasFriendCardTypeRefReadAccess());
//        Assertions.assertTrue(hasFriendCardTypeRefReadWriteAccess());
//
//        Assertions.assertTrue(hasFriendProjectReadAccess());
//        Assertions.assertFalse(hasFriendProjectReadWriteAccess());
//        Assertions.assertFalse(hasAnotherProjectReadAccess());
//        Assertions.assertFalse(hasAnotherProjectReadWriteAccess());

//        Assertions.assertTrue(hasDeliverableDocumentReadAccess());
//        Assertions.assertTrue(hasDeliverableDocumentReadWriteAccess());
//        Assertions.assertTrue(hasDeliverableBlockReadAccess());
//        Assertions.assertTrue(hasDeliverableBlockReadWriteAccess());

//    Assertions.assertTrue(hasLocalResourceReadAccess());
//    Assertions.assertTrue(hasLocalResourceReadWriteAccess());
//    Assertions.assertTrue(hasGlobalResourceReadAccess());
//    Assertions.assertTrue(hasGlobalResourceReadWriteAccess());
//    Assertions.assertTrue(hasDocumentReadAccess());
//    Assertions.assertTrue(hasDocumentReadWriteAccess());
//    Assertions.assertTrue(hasBlockReadAccess());
//    Assertions.assertTrue(hasBlockReadWriteAccess());
//    Assertions.assertTrue(hasActivityFlowLinkReadAccess());
//    Assertions.assertTrue(hasActivityFlowLinkReadWriteAccess());
//    Assertions.assertTrue(hasStickyNoteLinkReadAccess());
//    Assertions.assertTrue(hasStickyNoteLinkReadWriteAccess());
//  Assertions.assertTrue(hasTeamMemberReadAccess());
//  Assertions.assertTrue(hasTeamMemberReadWriteAccess());
//  Assertions.assertTrue(hasTeamRoleReadAccess());
//  Assertions.assertTrue(hasTeamRoleReadWriteAccess());

        aclTestClient.userRestEndpoint.signOut();
    }

//  // access setup
////
////  card.setDefaultInvolvementLevel(cardDefaultInvolvementLevel);
////  client.cardRestEndpoint.updateCard(card);
////  card = client.cardRestEndpoint.getCard(cardId);
////
////  client.teamRestEndpoint.giveRoleTo(role1Id, guestTeamMemberId);
////  client.teamRestEndpoint.giveRoleTo(role222Id, guestTeamMemberId);
////
////  if (role1InvolvementLevel != null) {
////      client.teamRestEndpoint.setRoleInvolvement(cardId, role1Id,
////          role1InvolvementLevel);
////  }
////
////  if (role222InvolvementLevel != null) {
////      client.teamRestEndpoint.setRoleInvolvement(cardId, role222Id,
////          role222InvolvementLevel);
////  }
////
////  if (teamMemberInvolvementLevel != null) {
////      client.teamRestEndpoint.setMemberInvolvement(cardId, guestTeamMemberId,
////          teamMemberInvolvementLevel);
//  }

    private boolean hasUnpublishedGlobalCardTypeReadAccess() {
        try {
            aclTestClient.cardTypeRestEndpoint.getCardType(data.getUnpublishedGlobalCardTypeId());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking unpublished global card type read access");
        return false;
    }

    private boolean hasUnpublishedGlobalCardTypeReadWriteAccess() {
        try {
            AbstractCardType abstractCardType = aclTestClient.cardTypeRestEndpoint
                .getCardType(data.getUnpublishedGlobalCardTypeId());
            CardType globalCardType = (CardType) abstractCardType;
            globalCardType.setTitle("game context");
            aclTestClient.cardTypeRestEndpoint.updateCardType(globalCardType);

            abstractCardType = aclTestClient.cardTypeRestEndpoint
                .getCardType(data.getUnpublishedGlobalCardTypeId());
            globalCardType = (CardType) abstractCardType;
            globalCardType.setTitle("the game context");
            aclTestClient.cardTypeRestEndpoint.updateCardType(globalCardType);

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking unpublished global card type read/write access");
        return false;
    }

    private boolean hasPublishedGlobalCardTypeReadAccess() {
        try {
            aclTestClient.cardTypeRestEndpoint.getCardType(data.getPublishedGlobalCardTypeId());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking published global card type read access");
        return false;
    }

    private boolean hasPublishedGlobalCardTypeReadWriteAccess() {
        try {
            AbstractCardType abstractCardType = aclTestClient.cardTypeRestEndpoint
                .getCardType(data.getPublishedGlobalCardTypeId());
            CardType globalCardType = (CardType) abstractCardType;
            globalCardType.setTitle("game context");
            aclTestClient.cardTypeRestEndpoint.updateCardType(globalCardType);

            abstractCardType = aclTestClient.cardTypeRestEndpoint
                .getCardType(data.getPublishedGlobalCardTypeId());
            globalCardType = (CardType) abstractCardType;
            globalCardType.setTitle("the game context");
            aclTestClient.cardTypeRestEndpoint.updateCardType(globalCardType);

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking published global card type read/write access");
        return false;
    }

    private boolean hasProjectReadAccess() {
        try {
            aclTestClient.projectRestEndpoint.getProject(data.getProjectId());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking project read access");
        return false;
    }

    private boolean hasProjectReadWriteAccess() {
        try {
            Project p = aclTestClient.projectRestEndpoint.getProject(data.getProjectId());
            p.setName("Welcome");
            aclTestClient.projectRestEndpoint.updateProject(p);

            p = aclTestClient.projectRestEndpoint.getProject(data.getProjectId());
            p.setName("free guy");
            aclTestClient.projectRestEndpoint.updateProject(p);

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking project read/write access");
        return false;
    }

    private boolean hasCardReadAccess() {
        try {
            aclTestClient.cardRestEndpoint.getCard(data.getCardId());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking card read access");
        return false;
    }

    private boolean hasCardReadWriteAccess() {
        try {
            Card aCard = aclTestClient.cardRestEndpoint.getCard(data.getCardId());
            aCard.setColor("black");
            aclTestClient.cardRestEndpoint.updateCard(aCard);

            aCard = aclTestClient.cardRestEndpoint.getCard(data.getCardId());
            aCard.setColor("orange");
            aclTestClient.cardRestEndpoint.updateCard(aCard);

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking card read/write access");
        return false;
    }

    private boolean hasCardContentReadAccess() {
        try {
            aclTestClient.cardContentRestEndpoint.getCardContent(data.getCardContentId());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking card content read access");
        return false;
    }

    private boolean hasCardContentReadWriteAccess() {
        try {
            CardContent cardContent = aclTestClient.cardContentRestEndpoint
                .getCardContent(data.getCardContentId());
            cardContent.setCompletionLevel(80);
            aclTestClient.cardContentRestEndpoint.updateCardContent(cardContent);

            cardContent = aclTestClient.cardContentRestEndpoint
                .getCardContent(data.getCardContentId());
            cardContent.setCompletionLevel(95);
            aclTestClient.cardContentRestEndpoint.updateCardContent(cardContent);

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking card content read/write access");
        return false;
    }

    private boolean hasGlobalCardTypeRefReadAccess() {
        try {
            aclTestClient.cardTypeRestEndpoint.getCardType(data.getGlobalCardTypeRefId());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking global card type reference read access");
        return false;
    }

    private boolean hasGlobalCardTypeRefReadWriteAccess() {
        try {
            AbstractCardType abstractCardType = aclTestClient.cardTypeRestEndpoint
                .getCardType(data.getGlobalCardTypeRefId());
            CardTypeRef cardTypeRef = (CardTypeRef) abstractCardType;
            cardTypeRef.setDeprecated(true);
            aclTestClient.cardTypeRestEndpoint.updateCardType(cardTypeRef);

            abstractCardType = aclTestClient.cardTypeRestEndpoint
                .getCardType(data.getGlobalCardTypeRefId());
            cardTypeRef = (CardTypeRef) abstractCardType;
            cardTypeRef.setDeprecated(false);
            aclTestClient.cardTypeRestEndpoint.updateCardType(cardTypeRef);

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking global card type reference read/write access");
        return false;
    }

    private boolean hasLocalCardTypeReadAccess() {
        try {
            aclTestClient.cardTypeRestEndpoint.getCardType(data.getLocalCardTypeId());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking local card type read access");
        return false;
    }

    private boolean hasLocalCardTypeReadWriteAccess() {
        try {
            AbstractCardType abstractCardType = aclTestClient.cardTypeRestEndpoint
                .getCardType(data.getLocalCardTypeId());
            CardType cardType = (CardType) abstractCardType;
            cardType.setTitle("design");
            aclTestClient.cardTypeRestEndpoint.updateCardType(cardType);

            abstractCardType = aclTestClient.cardTypeRestEndpoint
                .getCardType(data.getLocalCardTypeId());
            cardType = (CardType) abstractCardType;
            cardType.setTitle("design improvement");
            aclTestClient.cardTypeRestEndpoint.updateCardType(cardType);

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking local card type read/write access");
        return false;
    }

    private boolean hasFriendCardTypeReadAccess() {
        try {
            aclTestClient.cardTypeRestEndpoint.getCardType(data.getFriendCardTypeId());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking friend card type read access");
        return false;
    }

    private boolean hasFriendCardTypeReadWriteAccess() {
        try {
            AbstractCardType abstractCardType = aclTestClient.cardTypeRestEndpoint
                .getCardType(data.getFriendCardTypeId());
            CardType cardType = (CardType) abstractCardType;
            cardType.setTitle("design");
            aclTestClient.cardTypeRestEndpoint.updateCardType(cardType);

            abstractCardType = aclTestClient.cardTypeRestEndpoint
                .getCardType(data.getFriendCardTypeId());
            cardType = (CardType) abstractCardType;
            cardType.setTitle("design improvement");
            aclTestClient.cardTypeRestEndpoint.updateCardType(cardType);

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking friend card type read/write access");
        return false;
    }

    private boolean hasFriendCardTypeRefReadAccess() {
        try {
            aclTestClient.cardTypeRestEndpoint.getCardType(data.getFriendCardTypeRefId());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking friend card type reference read access");
        return false;
    }

    private boolean hasFriendCardTypeRefReadWriteAccess() {
        try {
            AbstractCardType abstractCardType = aclTestClient.cardTypeRestEndpoint
                .getCardType(data.getFriendCardTypeRefId());
            CardTypeRef cardTypeRef = (CardTypeRef) abstractCardType;
            cardTypeRef.setDeprecated(true);
            aclTestClient.cardTypeRestEndpoint.updateCardType(cardTypeRef);

            abstractCardType = aclTestClient.cardTypeRestEndpoint
                .getCardType(data.getFriendCardTypeRefId());
            cardTypeRef = (CardTypeRef) abstractCardType;
            cardTypeRef.setDeprecated(false);
            aclTestClient.cardTypeRestEndpoint.updateCardType(cardTypeRef);

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking friend card type reference read/write access");
        return false;
    }

    private boolean hasFriendProjectReadAccess() {
        try {
            aclTestClient.projectRestEndpoint.getProject(data.getFriendProjectId());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking friend project read access");
        return false;
    }

    private boolean hasFriendProjectReadWriteAccess() {
        try {
            Project p = aclTestClient.projectRestEndpoint.getProject(data.getFriendProjectId());
            p.setName("come as you are");
            aclTestClient.projectRestEndpoint.updateProject(p);

            p = aclTestClient.projectRestEndpoint.getProject(data.getFriendProjectId());
            p.setName("you are the one");
            aclTestClient.projectRestEndpoint.updateProject(p);

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking friend project read/write access");
        return false;
    }

    private boolean hasAnotherProjectReadAccess() {
        try {
            aclTestClient.projectRestEndpoint.getProject(data.getAnotherProjectId());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking another project read access");
        return false;
    }

    private boolean hasAnotherProjectReadWriteAccess() {
        try {
            Project p = aclTestClient.projectRestEndpoint.getProject(data.getAnotherProjectId());
            p.setName("I do not know you");
            aclTestClient.projectRestEndpoint.updateProject(p);

            p = aclTestClient.projectRestEndpoint.getProject(data.getAnotherProjectId());
            p.setName("who are you");
            aclTestClient.projectRestEndpoint.updateProject(p);

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking another project read/write access");
        return false;
    }

    private boolean hasDeliverableDocumentReadAccess() {
        try {
            aclTestClient.documentRestEndpoint.getDocument(data.getDeliverableDocumentId());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking deliverable document read/write access");
        return false;
    }

    private boolean hasDeliverableDocumentReadWriteAccess() {
        try {
            // TODO find another way
            Document document = aclTestClient.documentRestEndpoint
                .getDocument(data.getDeliverableDocumentId());
            //document.setTeaser("incredible");
            aclTestClient.documentRestEndpoint.updateDocument(document);

            document = aclTestClient.documentRestEndpoint
                .getDocument(data.getDeliverableDocumentId());
            //document.setTeaser("awesome");
            aclTestClient.documentRestEndpoint.updateDocument(document);

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking deliverable document read/write access");
        return false;
    }

//    private boolean hasDeliverableBlockReadAccess() {
//        try {
//            aclTestClient.blockRestEndpoint.getBlock(data.getDeliverableBlockId());
//            return true;
//        } catch (HttpErrorMessage hem) {
//            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
//                return false;
//            }
//        }
//        Assertions.fail("Problem checking deliverable block read/write access");
//        return false;
//    }

//    private boolean hasDeliverableBlockReadWriteAccess() {
//        try {
//            Block block = aclTestClient.blockRestEndpoint.getBlock(data.getDeliverableBlockId());
//            block.setIndex(5);
//            aclTestClient.blockRestEndpoint.updateBlock(block);
//
//            block = aclTestClient.blockRestEndpoint.getBlock(data.getDeliverableBlockId());
//            block.setIndex(7);
//            aclTestClient.blockRestEndpoint.updateBlock(block);
//
//            return true;
//        } catch (HttpErrorMessage hem) {
//            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
//                return false;
//            }
//        }
//        Assertions.fail("Problem checking deliverable block read/write access");
//        return false;
//    }



    private boolean hasGlobalResourceReadAccess() {
        try {
            aclTestClient.resourceRestEndpoint.getAbstractResource(data.getResourceIdGlobal());
            return true;
        } catch (@SuppressWarnings("unused") Exception e) {
            return false;
        }
//      Assertions.fail("Problem checking  read access");
//      return false;
    }

    private boolean hasGlobalResourceReadWriteAccess() {
        try {
            Resource resource = (Resource) aclTestClient.resourceRestEndpoint
                .getAbstractResource(data.getResourceIdGlobal());
            resource.setCategory("regular");
            aclTestClient.resourceRestEndpoint.updateResource(resource);

            resource = (Resource) aclTestClient.resourceRestEndpoint
                .getAbstractResource(data.getResourceIdGlobal());
            resource.setCategory("freestyle");
            aclTestClient.resourceRestEndpoint.updateResource(resource);

            return true;
        } catch (@SuppressWarnings("unused") Exception e) { // ServerException
            return false;
        }
//      Assertions.fail("Problem checking  read/write access");
//      return false;
    }

    private boolean hasLocalResourceReadAccess() {
        try {
            aclTestClient.resourceRestEndpoint.getAbstractResource(data.getResourceIdLocal());
            return true;
        } catch (@SuppressWarnings("unused") Exception e) {
            return false;
        }
//      Assertions.fail("Problem checking  read access");
//      return false;
    }

    private boolean hasLocalResourceReadWriteAccess() {
        try {
            Resource resource = (Resource) aclTestClient.resourceRestEndpoint
                .getAbstractResource(data.getResourceIdLocal());
            resource.setCategory("regular");
            aclTestClient.resourceRestEndpoint.updateResource(resource);

            resource = (Resource) aclTestClient.resourceRestEndpoint
                .getAbstractResource(data.getResourceIdLocal());
            resource.setCategory("freestyle");
            aclTestClient.resourceRestEndpoint.updateResource(resource);

            return true;
        } catch (@SuppressWarnings("unused") Exception e) { // ServerException
            return false;
        }
//      Assertions.fail("Problem checking  read/write access");
//      return false;
    }

    private boolean hasDocumentReadAccess() {
        try {
            aclTestClient.documentRestEndpoint.getDocument(data.getDocumentId());
            return true;
        } catch (@SuppressWarnings("unused") Exception e) {
            return false;
        }
//      Assertions.fail("Problem checking  read access");
//      return false;
    }

    private boolean hasDocumentReadWriteAccess() {
        try {
            // TODO find another way
            Document document = aclTestClient.documentRestEndpoint
                .getDocument(data.getDocumentId());
           // document.setTeaser("incredible");
            aclTestClient.documentRestEndpoint.updateDocument(document);

            document = aclTestClient.documentRestEndpoint
                .getDocument(data.getDocumentId());
            //document.setTeaser("awesome");
            aclTestClient.documentRestEndpoint.updateDocument(document);

            return true;
        } catch (@SuppressWarnings("unused") Exception e) { // ServerException
            return false;
        }
//      Assertions.fail("Problem checking  read/write access");
//      return false;
    }

    private boolean hasBlockReadAccess() {
        try {
            aclTestClient.blockRestEndpoint.getBlock(data.getBlockId());
            return true;
        } catch (@SuppressWarnings("unused") Exception e) {
            return false;
        }
//      Assertions.fail("Problem checking  read access");
//      return false;
    }

//    private boolean hasBlockReadWriteAccess() {
//        try {
//            Block block = aclTestClient.blockRestEndpoint.getBlock(data.getBlockId());
//            block.setIndex(5);
//            aclTestClient.blockRestEndpoint.updateBlock(block);
//
//            block = aclTestClient.blockRestEndpoint.getBlock(data.getBlockId());
//            block.setIndex(7);
//            aclTestClient.blockRestEndpoint.updateBlock(block);
//
//            return true;
//        } catch (@SuppressWarnings("unused") Exception e) { // ServerException
//            return false;
//        }
////      Assertions.fail("Problem checking  read/write access");
////      return false;
//    }

    private boolean hasActivityFlowLinkReadAccess() {
        try {
            aclTestClient.activityFlowLinkRestEndpoint.getLink(data.getActivityFlowLink());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking activity flow link read access");
        return false;
    }

    private boolean hasActivityFlowLinkReadWriteAccess() {
        try {
            ActivityFlowLink link = aclTestClient.activityFlowLinkRestEndpoint
                .getLink(data.getActivityFlowLink());
            aclTestClient.activityFlowLinkRestEndpoint.changeNextCard(link.getId(),
                data.getThirdCardId());

            link = aclTestClient.activityFlowLinkRestEndpoint
                .getLink(data.getActivityFlowLink());
            aclTestClient.activityFlowLinkRestEndpoint.changeNextCard(link.getId(),
                data.getSecondCardId());

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking activity flow link read/write access");
        return false;
    }

    private boolean hasStickyNoteLinkReadAccess() {
        try {
            aclTestClient.stickyNoteLinkRestEndpoint.getLink(data.getStickyNoteLink());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking  read access");
        return false;
    }

    private boolean hasStickyNoteLinkReadWriteAccess() {
        try {
            StickyNoteLink link = aclTestClient.stickyNoteLinkRestEndpoint
                .getLink(data.getStickyNoteLink());
            link.setTeaser("bla");
            aclTestClient.stickyNoteLinkRestEndpoint.updateLink(link);

            link = aclTestClient.stickyNoteLinkRestEndpoint
                .getLink(data.getStickyNoteLink());
            link.setTeaser("bloup");
            aclTestClient.stickyNoteLinkRestEndpoint.updateLink(link);

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking  read/write access");
        return false;
    }

    private boolean hasTeamRoleReadAccess() {
        try {
            aclTestClient.teamRestEndpoint.getRole(data.getRoleId());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking  read access");
        return false;
    }

    private boolean hasTeamRoleReadWriteAccess() {
        try {
            TeamRole role = aclTestClient.teamRestEndpoint.getRole(data.getRoleId());
            role.setName("Smurf");
            aclTestClient.teamRestEndpoint.updateRole(role);

            role = aclTestClient.teamRestEndpoint.getRole(data.getRoleId());
            role.setName("Garfield");
            aclTestClient.teamRestEndpoint.updateRole(role);

            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking  read/write access");
        return false;
    }

    private boolean hasTeamMemberReadAccess() {
        try {
            aclTestClient.teamRestEndpoint.getTeamMember(data.getSomeTeamMemberId());
            return true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                return false;
            }
        }
        Assertions.fail("Problem checking  read access");
        return false;
    }

    private boolean hasTeamMemberReadWriteAccess() {
        try {
            aclTestClient.teamRestEndpoint.changeMemberPosition(data.getSomeTeamMemberId(),
                HierarchicalPosition.INTERN);

            aclTestClient.teamRestEndpoint.changeMemberPosition(data.getSomeTeamMemberId(),
                HierarchicalPosition.EXTERN);

            return true;
        } catch (@SuppressWarnings("unused") Exception e) {
            return false;
        }
//      Assertions.fail("Problem checking  read/write access");
//      return false;
    }

//    private boolean hasReadAccess() {
//        try {
//            guestClient.
//            return true;
//        } catch(@SuppressWarnings("unused") Exception e) {
//            return false;
//        }
//    }
//
//    private boolean hasReadWriteAccess() {
//        try {
//            guestClient.
//            return true;
//        } catch(@SuppressWarnings("unused") Exception e) {
//            return false;
//        }
//    }
}
