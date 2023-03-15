/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.team;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.team.acl.InvolvementLevel;
import ch.colabproject.colab.client.ColabClient;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage.MessageCode;
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
            null /* member involvement level */,
            true /* can read card */,
            true /* can write card */);
    }

    @Test
    public void testHierarchicalPosition_intern() throws Exception {
        doTest(HierarchicalPosition.INTERNAL,
            null /* member involvement level */,
            true /* can read card */,
            true /* can write card */);
    }

    @Test
    public void testHierarchicalPosition_guest() throws Exception {
        doTest(HierarchicalPosition.GUEST,
            null /* member involvement level */,
            true /* can read card */,
            false /* can write card */);
    }

    @Test
    public void testMemberInvolvementLevel_R() throws Exception {
        doTest(HierarchicalPosition.GUEST,
            InvolvementLevel.RESPONSIBLE /* member involvement level */,
            true /* can read card */,
            true /* can write card */);
    }

    @Test
    public void testMemberInvolvementLevel_A() throws Exception {
        doTest(HierarchicalPosition.GUEST,
            InvolvementLevel.ACCOUNTABLE /* member involvement level */,
            true /* can read card */,
            true /* can write card */);
    }

    @Test
    public void testMemberInvolvementLevel_CRW() throws Exception {
        doTest(HierarchicalPosition.GUEST,
            InvolvementLevel.CONSULTED_READWRITE /* member involvement level */,
            true /* can read card */,
            true /* can write card */);
    }

    @Test
    public void testMemberInvolvementLevel_CRO() throws Exception {
        doTest(HierarchicalPosition.GUEST,
            InvolvementLevel.CONSULTED_READONLY /* member involvement level */,
            true /* can read card */,
            false /* can write card */);
    }

    @Test
    public void testMemberInvolvementLevel_IRW() throws Exception {
        doTest(HierarchicalPosition.GUEST,
            InvolvementLevel.INFORMED_READWRITE /* member involvement level */,
            true /* can read card */,
            true /* can write card */);
    }

    @Test
    public void testMemberInvolvementLevel_IRO() throws Exception {
        doTest(HierarchicalPosition.GUEST,
            InvolvementLevel.INFORMED_READONLY /* member involvement level */,
            true /* can read card */,
            false /* can write card */);
    }

    @Test
    public void testMemberInvolvementLevel_O() throws Exception {
        doTest(HierarchicalPosition.INTERNAL,
            InvolvementLevel.OUT_OF_THE_LOOP /* member involvement level */,
            true /* can read card */,
            false /* can write card */);
    }

    private void doTest(HierarchicalPosition hierarchicalPosition,
        InvolvementLevel memberInvolvementLevel,
        boolean expectedCanRead, boolean expectedCanWrite) throws Exception {
        // creation of the context :
        // project, global type, project type, card
        // role : designer
        Project project = ColabFactory.createProject(client, "testResource");
        Long projectId = project.getId();

        Long designerRoleId = ColabFactory.createRole(client, project, "designer").getId();
        Long developerRoleId = ColabFactory.createRole(client, project, "developer").getId();

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        Long globalCardTypeId = ColabFactory.createGlobalPublishedCardType(client).getId();

        Card card = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId);
        Long cardId = card.getId();

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

        if (memberInvolvementLevel != null) {
            client.teamRestEndpoint.setMemberInvolvement(cardId, guestTeamMemberId,
                memberInvolvementLevel);
        }

        // access check

        checkCanRead(guestHttpClient, cardId, expectedCanRead);
        checkCanWrite(guestHttpClient, cardId, expectedCanWrite);
    }

    /**
     * Verify if a card can be read
     *
     * @param guestHttpClient Colab client
     * @param card            the card
     * @param expectedCanRead the expected result
     */
    private static void checkCanRead(ColabClient guestHttpClient, Long cardId,
        boolean expectedCanRead) {
        boolean effectiveCanRead = false;
        try {
            checkReadAccess(guestHttpClient, cardId);
            effectiveCanRead = true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                effectiveCanRead = false;
            } else {
                Assertions.fail(hem);
            }
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
     * Verify if a card can be modified
     *
     * @param guestHttpClient  Colab client
     * @param card             the card
     * @param expectedCanWrite the expected result
     */
    private static void checkCanWrite(ColabClient guestHttpClient, Long cardId,
        boolean expectedCanWrite) {

        boolean effectiveCanWrite = false;
        try {
            checkReadWriteAccess(guestHttpClient, cardId);
            effectiveCanWrite = true;
        } catch (HttpErrorMessage hem) {
            if (MessageCode.ACCESS_DENIED == hem.getMessageCode()) {
                effectiveCanWrite = false;
            } else {
                Assertions.fail(hem);
            }
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
