/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.team;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.team.acl.InvolvementLevel;
import ch.colabproject.colab.client.ColabClient;
import ch.colabproject.colab.generator.plugin.rest.ServerException;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import ch.colabproject.colab.tests.tests.TestUser;
import ch.colabproject.colab.tests.ws.WebsocketClient;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of the team rest end point from a client point of view
 *
 * @author sandra
 */
public class EffectiveAccessControlTeamRestEndpointTest extends AbstractArquillianTest {

    @Test
    public void testHierarchicalPosition_owner() throws Exception {
        doTest(HierarchicalPosition.OWNER,
            null /* role involvement level */,
            true /* can read card */,
            true /* can write card */);
    }

    @Test
    public void testLHierarchicalPosition_lead() throws Exception {
        doTest(HierarchicalPosition.LEAD,
            null /* role involvement level */,
            true /* can read card */,
            true /* can write card */);
    }

    @Test
    public void testHierarchicalPosition_intern() throws Exception {
        doTest(HierarchicalPosition.INTERN,
            null /* role involvement level */,
            true /* can read card */,
            true /* can write card */);
    }

//    @Test
//    public void testRoleInvolvementLevel_O() throws Exception {
//        doTest(HierarchicalPosition.INTERN,
//            InvolvementLevel.OUT_OF_THE_LOOP /* role involvement level */,
//            false /* can read card */,
//            false /* can write card */);
//    }

//    @Test
//    public void testHierarchicalPosition_extern() throws Exception {
//        doTest(HierarchicalPosition.EXTERN,
//            null /* role involvement level */,
//            false /* can read card */,
//            false /* can write card */);
//    }

//    @Test
//    public void testRoleInvolvementLevel_R() throws Exception {
//        doTest(HierarchicalPosition.EXTERN,
//            InvolvementLevel.RESPONSIBLE /* role involvement level */,
//            true /* can read card */,
//            true /* can write card */);
//    }
//
//    @Test
//    public void testRoleInvolvementLevel_A() throws Exception {
//        doTest(HierarchicalPosition.EXTERN,
//            InvolvementLevel.ACCOUNTABLE /* role involvement level */,
//            true /* can read card */,
//            true /* can write card */);
//    }
//
//    @Test
//    public void testRoleInvolvementLevel_CRW() throws Exception {
//        doTest(HierarchicalPosition.EXTERN,
//            InvolvementLevel.CONSULTED_READWRITE /* role involvement level */,
//            true /* can read card */,
//            true /* can write card */);
//    }
//
//    @Test
//    public void testRoleInvolvementLevel_CRO() throws Exception {
//        doTest(HierarchicalPosition.EXTERN,
//            InvolvementLevel.CONSULTED_READONLY /* role involvement level */,
//            true /* can read card */,
//            false /* can write card */);
//    }
//
//    @Test
//    public void testRoleInvolvementLevel_IRW() throws Exception {
//        doTest(HierarchicalPosition.EXTERN,
//            InvolvementLevel.INFORMED_READWRITE /* role involvement level */,
//            true /* can read card */,
//            true /* can write card */);
//    }
//
//    @Test
//    public void testRoleInvolvementLevel_IRO() throws Exception {
//        doTest(HierarchicalPosition.EXTERN,
//            InvolvementLevel.INFORMED_READONLY /* role involvement level */,
//            true /* can read card */,
//            false /* can write card */);
//    }

    private void doTest(HierarchicalPosition hierarchicalPosition,
        InvolvementLevel roleInvolvementLevel,
        boolean expectedCanRead, boolean expectedCanWrite) throws Exception {
        // creation of the context :
        // project, global type, project type, card, sub card,
        // role : designer
        Project project = ColabFactory.createProject(client, "testResource");
        Long projectId = project.getId();

        Long designerRoleId = ColabFactory.createRole(client, project, "designer").getId();
        Long developerRoleId = ColabFactory.createRole(client, project, "developer").getId();

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        Long globalCardTypeId = ColabFactory.createPublishedCardType(client, null).getId();

        Card card = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId);
        Long cardId = card.getId();

        Long cardContentId = ColabFactory.getCardContent(client, cardId).getId();

        Long subCardTypeId = ColabFactory.createCardType(client, projectId).getId();

        Card subCard = ColabFactory.createNewCard(client, cardContentId, subCardTypeId);
        Long subCardId = subCard.getId();

        // new team member

        TestUser guestACL = this.signup(
            "guestACL",
            "guestacl@test.local",
            "9u3stACL43v3r");
        ColabClient guestHttpClient = this.createRestClient();
        this.signIn(guestHttpClient, guestACL);
        WebsocketClient guestWsClient = this.createWsClient();
        guestHttpClient.websocketRestEndpoint
            .subscribeToBroadcastChannel(guestWsClient.getSessionId());
        guestHttpClient.websocketRestEndpoint.subscribeToUserChannel(guestWsClient.getSessionId());

        // invited to the project

        Long guestTeamMemberId = ColabFactory.inviteAndJoin(client, project,
            "guestacl@test.local", guestHttpClient, mailClient).getId();

        guestHttpClient.websocketRestEndpoint.subscribeToProjectChannel(projectId,
            guestWsClient.getSessionId());

        // access setup

        client.teamRestEndpoint.changeMemberPosition(guestTeamMemberId, hierarchicalPosition);

        client.teamRestEndpoint.giveRoleTo(designerRoleId, guestTeamMemberId);
        client.teamRestEndpoint.giveRoleTo(developerRoleId, guestTeamMemberId);

        if (roleInvolvementLevel != null) {
//            client.teamRestEndpoint.setRoleInvolvement(cardId, designerRoleId,
//                roleInvolvementLevel);
            client.teamRestEndpoint.setMemberInvolvement(cardId, guestTeamMemberId,
                roleInvolvementLevel);
        }

        // access check

        checkCanRead(guestHttpClient, cardId, subCardId, expectedCanRead);
        checkCanWrite(guestHttpClient, cardId, subCardId, expectedCanWrite);
    }

    /**
     * Verify if a card and its sub card can be read
     *
     * @param guestHttpClient Colab client
     * @param card            the card
     * @param subCard         the sub card
     * @param expectedCanRead the expected result
     */
    private static void checkCanRead(ColabClient guestHttpClient, Long cardId, Long subCardId,
        boolean expectedCanRead) {
        boolean effectiveCanRead = false;
        try {
            checkReadAccess(guestHttpClient, cardId);
            checkReadAccess(guestHttpClient, subCardId);
            effectiveCanRead = true;
//        } catch (HttpErrorMessage hem) {
//            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
//                effectiveCanRead = false;
//            } else {
//                Assertions.fail(hem);
//            }
        } catch (@SuppressWarnings("unused") ServerException se) {
            effectiveCanRead = false;
            // TODO see if can check it more accurately
        } catch (Exception e) {
            Assertions.fail(e);
        }

        Assertions.assertTrue(expectedCanRead == effectiveCanRead, "read permission check failed");
    }

    /**
     * A way to check the permission to read a card
     *
     * @param guestHttpClient the colab client of the user
     * @param card            the card to check
     */
    private static void checkReadAccess(ColabClient guestHttpClient, Long cardId) {
        guestHttpClient.cardRestEndpoint.getContentVariantsOfCard(cardId);
    }

    /**
     * Verify if a card and its sub card can be modified
     *
     * @param guestHttpClient  Colab client
     * @param card             the card
     * @param subCard          the sub card
     * @param expectedCanWrite the expected result
     */
    private static void checkCanWrite(ColabClient guestHttpClient, Long cardId, Long subCardId,
        boolean expectedCanWrite) {

        boolean effectiveCanWrite = false;
        try {
            checkReadWriteAccess(guestHttpClient, cardId);
            checkReadWriteAccess(guestHttpClient, subCardId);
            effectiveCanWrite = true;
//        } catch (HttpErrorMessage hem) {
//            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
//                effectiveCanWrite = false;
//            } else {
//                Assertions.fail(hem);
//            }
        } catch (@SuppressWarnings("unused") ServerException se) {
            effectiveCanWrite = false;
            // TODO see if can check it more accurately
        } catch (Exception e) {
            Assertions.fail(e);
        }

        Assertions.assertTrue(expectedCanWrite == effectiveCanWrite,
            "write permission check failed");
    }

    /**
     * A way to check the permission to read and write a card
     *
     * @param guestHttpClient the colab client of the user
     * @param card            the card to check
     */
    private static void checkReadWriteAccess(ColabClient guestHttpClient, Long cardId) {
        Card persistedCard = guestHttpClient.cardRestEndpoint.getCard(cardId);
        persistedCard.setColor("lemongreen"); // any change on the card
        guestHttpClient.cardRestEndpoint.updateCard(persistedCard);
    }
}
