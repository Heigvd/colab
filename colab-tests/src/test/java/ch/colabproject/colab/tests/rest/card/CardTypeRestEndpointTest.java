/*
 * The coLAB projectOne
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.card;

import ch.colabproject.colab.api.model.ConcretizationCategory;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.card.CardTypeRef;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.ws.message.WsChannelUpdate;
import ch.colabproject.colab.api.ws.message.WsUpdateMessage;
import ch.colabproject.colab.client.ColabClient;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import ch.colabproject.colab.tests.tests.TestHelper;
import ch.colabproject.colab.tests.tests.TestUser;
import ch.colabproject.colab.tests.ws.WebsocketClient;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import javax.websocket.DeploymentException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of card type controller from a client point of view
 *
 * @author sandra
 */
public class CardTypeRestEndpointTest extends AbstractArquillianTest {

    @Test
    public void testCreateCardType() {
        Long projectId = ColabFactory.createProject(client, "testCreateCardType").getId();
        CardType cardType = ColabFactory.createCardType(client, projectId);

        Assertions.assertNotNull(cardType);
        Assertions.assertNotNull(cardType.getId());
        Assertions.assertNull(cardType.getUniqueId());
        Assertions.assertNull(cardType.getTitle());
        Assertions.assertNull(cardType.getPurpose());
        Assertions.assertNull(cardType.getAuthorityHolder());
        Assertions.assertEquals(projectId, cardType.getProjectId());
    }

    @Test
    public void testCreateAndUseGlobalCardType() throws DeploymentException, IOException, URISyntaxException, InterruptedException {
        // create some goulash user with its own clients
        TestUser goulash = this.signup(
            "goulash",
            "goulash@test.local",
            "MyPassword");
        ColabClient goulashClient = this.createRestClient();
        this.signIn(goulashClient, goulash);
        WebsocketClient wsGoulashClient = this.createWsClient();
        goulashClient.websocketRestEndpoint.subscribeToBroadcastChannel(wsGoulashClient.getSessionId());
        goulashClient.websocketRestEndpoint.subscribeToUserChannel(wsGoulashClient.getSessionId());

        // Sign in as admin and initialize websocket connection
        this.signIn(admin);
        WebsocketClient adminWsClient = this.createWsClient();
        client.websocketRestEndpoint.subscribeToBroadcastChannel(adminWsClient.getSessionId());
        client.websocketRestEndpoint.subscribeToUserChannel(adminWsClient.getSessionId());

        // Wait for ChannelUpdateMessage
        TestHelper.waitForMessagesAndAssert(adminWsClient, 1, 5, WsChannelUpdate.class);

        // -----
        // Global type
        // -----
        adminWsClient.clearMessages();
        wsGoulashClient.clearMessages();
        CardType globalType = ColabFactory.createCardType(client, null);

        // admin should have receive the type by websocket
        WsUpdateMessage adminWsType = TestHelper.waitForMessagesAndAssert(
            adminWsClient, 1, 5, WsUpdateMessage.class).get(0);
        Assertions.assertEquals(1, adminWsType.getUpdated().size());
        CardType aWsCardType = TestHelper.findFirst(adminWsType.getUpdated(), CardType.class);

        //Publish the projectOneType
        globalType.setPublished(true);
        client.cardTypeRestEndpoint.updateCardType(globalType);

        // Assert the published type is sent to all users
        WsUpdateMessage goulashGlobalTypeUpdate = TestHelper.waitForMessagesAndAssert(
            wsGoulashClient, 1, 5, WsUpdateMessage.class).get(0);
        Assertions.assertEquals(1, goulashGlobalTypeUpdate.getUpdated().size());
        aWsCardType = TestHelper.findFirst(goulashGlobalTypeUpdate.getUpdated(), CardType.class);
        Assertions.assertEquals(globalType, aWsCardType);
        Assertions.assertTrue(aWsCardType.isPublished());

        // -----
        // Global type is used by projectOne
        // -----
        Project projectOne = ColabFactory.createProject(client, "Project One");
        Set<AbstractCardType> types = client.projectRestEndpoint.getCardTypesOfProject(projectOne.getId());
        Assertions.assertEquals(0, types.size());

        Long parentId = ColabFactory.getRootContent(client, projectOne).getId();

        // create a card based on a global type
        ColabFactory.createNewCard(client, parentId, globalType.getId());

        // assert the project now contains a CardTypeRef to the global type
        types = client.projectRestEndpoint.getCardTypesOfProject(projectOne.getId());
        // One concrete type
        List<CardType> concrete = TestHelper.filterAndAssert(types, 1, CardType.class);

        // One type reference
        List<CardTypeRef> refs = TestHelper.filterAndAssert(types, 1, CardTypeRef.class);

        CardType theType = concrete.get(0);
        CardTypeRef projectOneRef = refs.get(0);

        Assertions.assertEquals(projectOne.getId(), projectOneRef.getProjectId());
        Assertions.assertEquals(globalType.getId(), projectOneRef.getAbstractCardTypeId());
        Assertions.assertEquals(globalType, theType);

        // -----
        // ProjectOne type is used by projectTwo
        // -----
        Project projectTwo = ColabFactory.createProject(client, "Project Two");
        parentId = ColabFactory.getRootContent(client, projectTwo).getId();

        // create a card based on projectOne type
        ColabFactory.createNewCard(client, parentId, projectOneRef.getId());

        // assert the project now contains a CardTypeRef to the project one type
        types = client.projectRestEndpoint.getCardTypesOfProject(projectTwo.getId());
        // One concrete type
        concrete = TestHelper.filterAndAssert(types, 1, CardType.class);

        // One type reference
        refs = TestHelper.filterAndAssert(types, 2, CardTypeRef.class);

        theType = concrete.get(0);

        Optional<CardTypeRef> optRef = refs.stream().filter(ref -> projectTwo.getId().equals(ref.getProjectId())).findFirst();
        Assertions.assertTrue(optRef.isPresent());
        CardTypeRef projectTwoRef = optRef.get();

        Assertions.assertEquals(projectTwo.getId(), projectTwoRef.getProjectId());
        Assertions.assertEquals(projectOneRef.getId(), projectTwoRef.getAbstractCardTypeId());
        Assertions.assertEquals(globalType, theType);
    }

    @Test
    public void testCreateAndReuseCardType() throws DeploymentException, IOException, URISyntaxException, InterruptedException {
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketHelper.class), Level.TRACE);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketClient.class), Level.TRACE);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketFacade.class), Level.TRACE);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(TransactionManager.class), Level.TRACE);

        // create some goulash user with its own clients
        TestUser goulash = this.signup(
            "goulashsensei",
            "goulash@test.local",
            "MyPassword");
        // Sign in as goulash and initialize websocket connection
        this.signIn(goulash);
        WebsocketClient wsClient = this.createWsClient();
        client.websocketRestEndpoint.subscribeToBroadcastChannel(wsClient.getSessionId());
        client.websocketRestEndpoint.subscribeToUserChannel(wsClient.getSessionId());

        TestUser pizzaiolo = this.signup(
            "pizzaiolo",
            "pizza@test.local",
            "qu3stap1zzaèlamI9lior3d3l0OndO");
        // Sign in as goulash and initialize websocket connection
        ColabClient pizzaHttpClient = this.createRestClient();
        this.signIn(pizzaHttpClient, pizzaiolo);
        WebsocketClient pizzaWsClient = this.createWsClient();
        pizzaHttpClient.websocketRestEndpoint.subscribeToBroadcastChannel(pizzaWsClient.getSessionId());
        pizzaHttpClient.websocketRestEndpoint.subscribeToUserChannel(pizzaWsClient.getSessionId());

        // -----
        // Goulash creates a project
        // -----
        Project projectOne = ColabFactory.createProject(client, "Project One");
        Assertions.assertEquals(0, client.projectRestEndpoint.getCardTypesOfProject(projectOne.getId()).size());
        client.websocketRestEndpoint.subscribeToProjectChannel(projectOne.getId(), wsClient.getSessionId());

        // wait for propagation
        TestHelper.waitForMessagesAndAssert(wsClient, 1, 5, WsUpdateMessage.class).get(0);

        // -----
        // Create type in project one
        // -----
        CardType projectOneType = ColabFactory.createCardType(client, projectOne.getId());

        // user should have receive two message. One contains the project and has been sent through
        // the user own channel. Second message contains the type and has been send through the
        // project channel
        List<WsUpdateMessage> wsUpdate = TestHelper.waitForMessagesAndAssert(wsClient, 2, 5, WsUpdateMessage.class);
        // combine messages
        Set<WithWebsocketChannels> updated = new HashSet<>();
        updated.addAll(wsUpdate.get(0).getUpdated());
        updated.addAll(wsUpdate.get(1).getUpdated());

        //Assertions.assertEquals(1, wsUpdate.getUpdated().size());
        CardType wsProjectOneType = TestHelper.findFirst(updated, CardType.class);
        Assertions.assertEquals(projectOneType, wsProjectOneType);

        // create a card based on the type
        Long projectOneRootContentId = ColabFactory.getRootContent(client, projectOne).getId();
        ColabFactory.createNewCard(client, projectOneRootContentId, projectOneType.getId());

        // consume websocket message
        TestHelper.waitForMessagesAndAssert(wsClient, 1, 5, WsUpdateMessage.class).get(0);

        // As the type is not published, Goulash does not read it from the published list
        Assertions.assertTrue(client.cardTypeRestEndpoint.getPublishedCardTypes().isEmpty());

        // but can read it from the project list
        Assertions.assertEquals(1, client.projectRestEndpoint.getCardTypesOfProject(projectOne.getId()).size());

        // Goulash creates projectTwo
        Project projectTwo = ColabFactory.createProject(client, "Project Two");

        // consume websocket message (new project)
        TestHelper.waitForMessagesAndAssert(wsClient, 1, 5, WsUpdateMessage.class).get(0);

        // Goulash invites pizzaiolo
        ColabFactory.inviteAndJoin(client, projectTwo, "pizza@pizza.local", pizzaHttpClient, mailClient);

        // consume 2 websocket messages (new invitation; new team member)
        TestHelper.waitForMessagesAndAssert(wsClient, 2, 5, WsUpdateMessage.class).get(0);
        this.client.websocketRestEndpoint.subscribeToProjectChannel(projectTwo.getId(), wsClient.getSessionId());

        // pizza consume 1 websocket message (new team member)
        TestHelper.waitForMessagesAndAssert(pizzaWsClient, 1, 5, WsUpdateMessage.class).get(0);

        pizzaHttpClient.websocketRestEndpoint.subscribeToProjectChannel(projectTwo.getId(), pizzaWsClient.getSessionId());

        // publish the projectOneType
        projectOneType.setPublished(true);
        client.cardTypeRestEndpoint.updateCardType(projectOneType);

        // it is visible for goulash
        Assertions.assertEquals(1l, client.cardTypeRestEndpoint.getPublishedCardTypes().size());
        // consume websocket messages (one through project channel, other through user channel)
        TestHelper.waitForMessagesAndAssert(wsClient, 2, 5, WsUpdateMessage.class).get(0);

        // but not for pizzaiolo
        Assertions.assertEquals(0, pizzaHttpClient.cardTypeRestEndpoint.getPublishedCardTypes().size());

        // goulash create a card in projectTwo based on the projectOne type
        Long projectTwoRootContentId = ColabFactory.getRootContent(client, projectTwo).getId();
        ColabFactory.createNewCard(client, projectTwoRootContentId, projectOneType.getId());
        // consume websocket messages (overview update; project 1 update; project 2 update)
        TestHelper.waitForMessagesAndAssert(wsClient, 3, 5, WsUpdateMessage.class).get(0);
        // consume websocket messages (overview update; project 2 update)
        TestHelper.waitForMessagesAndAssert(pizzaWsClient, 2, 5, WsUpdateMessage.class).get(0);

        // goulash and pizzaiolo can now access the type through the reference from projectTwo
        Set<AbstractCardType> goulashTypes = client.projectRestEndpoint.getCardTypesOfProject(projectTwo.getId());
        Set<AbstractCardType> pizzaTypes = pizzaHttpClient.projectRestEndpoint.getCardTypesOfProject(projectTwo.getId());

        TestHelper.assertEquals(goulashTypes, pizzaTypes);

        // Update the projectOneType
        projectOneType.setTitle("My Favourite Recipes");
        projectOneType.setPurpose("How to cook dishes from all over the world");
        client.cardTypeRestEndpoint.updateCardType(projectOneType);

        // both goulash and pizzaiolo should receive the update through websocket
        // goulahs consume thrww websocket messages: (overview update; project 1 update; project 2 update)
        WsUpdateMessage goulashMessage = TestHelper.waitForMessagesAndAssert(wsClient, 3, 5, WsUpdateMessage.class).get(0);
        // (as type in project is not published, it's not propagated to Pizza, this only one message is sent)
        WsUpdateMessage pizzaMessage = TestHelper.waitForMessagesAndAssert(pizzaWsClient, 1, 5, WsUpdateMessage.class).get(0);

        List<CardType> pizzaList = TestHelper.filterAndAssert(pizzaMessage.getUpdated(), 1, CardType.class);
        CardType pizzaType = pizzaList.get(0);

        List<CardType> goulashList = TestHelper.filterAndAssert(goulashMessage.getUpdated(), 1, CardType.class);
        CardType goulashType = goulashList.get(0);

        Assertions.assertEquals(pizzaType, goulashType);
        Assertions.assertEquals(projectOneType.getTitle(), goulashType.getTitle());
        Assertions.assertEquals(projectOneType.getTitle(), pizzaType.getTitle());
    }

    @Test
    public void testUpdateCardType() {
        Long projectId = ColabFactory.createProject(client, "testUpdateCardType").getId();

        // String uniqueId = String.valueOf(new Date().getTime() + ((long)(Math.random()
        // * 1000)));
        String title = "Dissemination " + ((int) (Math.random() * 1000));
        String purpose = "Define how the project will be promoted "
            + ((int) (Math.random() * 1000));
        ConcretizationCategory authorityHolder = ConcretizationCategory.PROJECT;

        CardType cardType = ColabFactory.createCardType(client, projectId);

        Assertions.assertNull(cardType.getUniqueId());
        Assertions.assertNull(cardType.getTitle());
        Assertions.assertNull(cardType.getPurpose());
        Assertions.assertNull(cardType.getAuthorityHolder());

        // cardType.setUniqueId(uniqueId);
        cardType.setTitle(title);
        cardType.setPurpose(purpose);
        cardType.setAuthorityHolder(authorityHolder);
        client.cardTypeRestEndpoint.updateCardType(cardType);

        CardType persistedCardType = (CardType) client.cardTypeRestEndpoint.getCardType(cardType.getId());
        // Assertions.assertEquals(uniqueId, persistedCardType2.getUniqueId());
        Assertions.assertEquals(title, persistedCardType.getTitle());
        Assertions.assertEquals(purpose, persistedCardType.getPurpose());
        // Assertions.assertEquals(authorityHolder,
        // persistedCardType2.getAuthorityHolderType());
    }

    @Test
    public void testGetAllCardTypes() {
        Long projectId = ColabFactory.createProject(client, "testGetAllCardTypes").getId();
        int initialSize = client.cardTypeRestEndpoint.getAllCardTypes().size();

        CardType cardType1 = ColabFactory.createCardType(client, projectId);
        cardType1.setTitle("Game design " + ((int) (Math.random() * 1000)));
        client.cardTypeRestEndpoint.updateCardType(cardType1);

        List<CardType> cardTypes = client.cardTypeRestEndpoint.getAllCardTypes();
        Assertions.assertEquals(initialSize + 1, cardTypes.size());

        CardType cardType2 = ColabFactory.createCardType(client, projectId);
        cardType2.setTitle("Game rules " + ((int) (Math.random() * 1000)));
        client.cardTypeRestEndpoint.updateCardType(cardType2);

        cardTypes = client.cardTypeRestEndpoint.getAllCardTypes();
        Assertions.assertEquals(initialSize + 2, cardTypes.size());
    }

    @Test
    public void testDeleteCardType() {
        Long projectId = ColabFactory.createProject(client, "testDeleteCardType").getId();

        CardType cardType = ColabFactory.createCardType(client, projectId);
        Long cardTypeId = cardType.getId();

        CardType persistedCardType = (CardType) client.cardTypeRestEndpoint.getCardType(cardTypeId);
        Assertions.assertNotNull(persistedCardType);

        client.cardTypeRestEndpoint.deleteCardType(cardTypeId);

        persistedCardType = (CardType) client.cardTypeRestEndpoint.getCardType(cardTypeId);
        Assertions.assertNull(persistedCardType);
    }

    @Test
    public void testProjectAccess() {
        String projectName = "Easy learn german " + ((int) (Math.random() * 1000));

        Project project = ColabFactory.createProject(client, projectName);
        Long projectId = project.getId();

        CardType cardType = ColabFactory.createCardType(client, projectId);
        Long cardTypeId = cardType.getId();

        Assertions.assertEquals(projectId, cardType.getProjectId());

        Set<AbstractCardType> cardTypesOfProject = client.projectRestEndpoint.getCardTypesOfProject(projectId);
        Assertions.assertNotNull(cardTypesOfProject);
        Assertions.assertEquals(1, cardTypesOfProject.size());
        Assertions.assertEquals(cardTypeId, cardTypesOfProject.iterator().next().getId());

        client.cardTypeRestEndpoint.deleteCardType(cardTypeId);

        cardTypesOfProject = client.projectRestEndpoint.getCardTypesOfProject(projectId);
        Assertions.assertNotNull(cardTypesOfProject);
        Assertions.assertEquals(0, cardTypesOfProject.size());
    }
}
