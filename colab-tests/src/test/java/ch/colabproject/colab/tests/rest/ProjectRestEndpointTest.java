/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.token.InvitationToken;
import ch.colabproject.colab.api.model.token.Token;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.ws.message.WsUpdateMessage;
import ch.colabproject.colab.client.ColabClient;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.tests.mailhog.model.Message;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import ch.colabproject.colab.tests.tests.TestHelper;
import ch.colabproject.colab.tests.tests.TestUser;
import ch.colabproject.colab.tests.ws.WebsocketClient;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import javax.websocket.DeploymentException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * @author maxence
 */
public class ProjectRestEndpointTest extends AbstractArquillianTest {

    @Test
    public void testCreateDeleteProject() {
        TestUser user = this.signup("goulashsensei", "goulash@test.local", "SoSecure");
        this.signIn(user);

        User currentUser = client.userRestEndpoint.getCurrentUser();

        Project project = new Project();

        Long projectId = client.projectRestEndpoint.createProject(project);

        Project persistedProject = client.projectRestEndpoint.getProject(projectId);
        Assertions.assertNotNull(persistedProject);
        Assertions.assertNotNull(persistedProject.getId());
        Assertions.assertEquals(persistedProject.getId(), projectId);

        Assertions.assertNotNull(persistedProject.getRootCardId());
        Long rootCardId = persistedProject.getRootCardId();
        Card rootCard = client.cardRestEndpoint.getCard(rootCardId);
        Assertions.assertNotNull(rootCard);
        List<CardContent> rootCardContents = client.cardRestEndpoint
            .getContentVariantsOfCard(rootCard.getId());
        Assertions.assertNotNull(rootCardContents);
        Assertions.assertEquals(1, rootCardContents.size());

        List<TeamMember> members = client.projectRestEndpoint.getMembers(projectId);
        Assertions.assertEquals(1, members.size());

        TeamMember me = members.get(0);
        Assertions.assertEquals(currentUser.getId(), me.getUserId());
        Assertions.assertEquals(projectId, me.getProjectId());

        // delete it
        client.projectRestEndpoint.deleteProject(projectId);

        persistedProject = client.projectRestEndpoint.getProject(projectId);
        Assertions.assertNull(persistedProject);

        rootCard = client.cardRestEndpoint.getCard(rootCardId);
        Assertions.assertNull(rootCard);

        boolean wasError = false;
        try {
            rootCardContents = client.cardRestEndpoint.getContentVariantsOfCard(rootCardId);
        } catch (HttpErrorMessage hem) {
            Assertions.assertEquals(HttpErrorMessage.MessageCode.RELATED_OBJECT_NOT_FOUND,
                hem.getMessageCode());
            wasError = true;
        }
        if (!wasError) {
            Assertions.fail();
        }

        wasError = false;
        try {
            members = client.projectRestEndpoint.getMembers(projectId);
        } catch (HttpErrorMessage hem) {
            Assertions.assertEquals(HttpErrorMessage.MessageCode.RELATED_OBJECT_NOT_FOUND,
                hem.getMessageCode());
            wasError = true;
        }
        if (!wasError) {
            Assertions.fail();
        }
    }

    @Test
    public void testUpdateProject() {
        Project project = new Project();

        Long projectId = client.projectRestEndpoint.createProject(project);
        project = client.projectRestEndpoint.getProject(projectId);
        project.setName("The Hitchhiker's Guide to the Serious-Game");
        project.setDescription("So Long, and Thanks for All the Games");

        client.projectRestEndpoint.updateProject(project);

        Project project2 = client.projectRestEndpoint.getProject(projectId);
        Assertions.assertEquals(project.getName(), project2.getName());
        Assertions.assertEquals(project.getDescription(), project2.getDescription());
    }

    @Test
    public void testGetAllProjects() {
        Project project = new Project();
        project.setName("The Hitchhiker's Guide to the Serious-Game");
        client.projectRestEndpoint.createProject(project);

        project = new Project();
        project.setName("Don't Panic");
        client.projectRestEndpoint.createProject(project);

        List<Project> projects = client.projectRestEndpoint.getAllProjects();
        Assertions.assertEquals(2, projects.size());
    }

    @Test
    public void testInvite()
        throws URISyntaxException, DeploymentException, IOException, InterruptedException {
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketHelper.class), Level.TRACE);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketClient.class), Level.TRACE);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketFacade.class), Level.TRACE);
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(TransactionManager.class), Level.TRACE);

        ////////////////////////////////////////////////////////////////////////////////////////////
        // this.client sign up as GoulashSensei and subscribes to its channel with wsGoulashClient
        ////////////////////////////////////////////////////////////////////////////////////////////
        TestUser user = this.signup("goulashsensei", "goulash@test.local", "SoSecure");
        String mateAddress = "georges@valgeorges.local";
        this.signIn(user);

        WebsocketClient wsGoulashClient = this.createWsClient();
        client.websocketRestEndpoint.subscribeToUserChannel(wsGoulashClient.getSessionId());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Goulash creates a projects
        ////////////////////////////////////////////////////////////////////////////////////////////
        Project p = new Project();
        p.setName("The Hitchhiker's Guide to the Serious-Game");

        Long projectId = client.projectRestEndpoint.createProject(p);

        // Goulash receives the project, the user (ie himself) and the teamMmeber linking the
        // project to the user
        WsUpdateMessage wsProjectUpdate = TestHelper
            .waitForMessagesAndAssert(wsGoulashClient, 1, 5, WsUpdateMessage.class).get(0);
        // project, teamMember, user
        Assertions.assertEquals(3, wsProjectUpdate.getUpdated().size(),
            "Got " + wsProjectUpdate.getUpdated());

        Project project = TestHelper.findFirst(wsProjectUpdate.getUpdated(), Project.class);
        TeamMember member = TestHelper.findFirst(wsProjectUpdate.getUpdated(), TeamMember.class);
        User wsUpdatedUser = TestHelper.findFirst(wsProjectUpdate.getUpdated(), User.class);

        Assertions.assertEquals(projectId, project.getId());
        Assertions.assertEquals(projectId, member.getProjectId());
        Assertions.assertEquals(member.getUserId(), wsUpdatedUser.getId());

        // user is a lonely team member
        List<TeamMember> members = client.projectRestEndpoint.getMembers(project.getId());
        Assertions.assertEquals(1, members.size());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Goulash invites Georges
        ////////////////////////////////////////////////////////////////////////////////////////////
        mailClient.deleteAllMessages();
        client.teamRestEndpoint.inviteSomeone(projectId, mateAddress);

        // Invitation creates a TeamMember and touch the project;
        // The two objects are propagated to goulashsensei
        WsUpdateMessage wsInvitationUpdate = TestHelper.waitForMessagesAndAssert(
            wsGoulashClient, 1, 5, WsUpdateMessage.class).get(0);
        Assertions.assertEquals(2, wsInvitationUpdate.getUpdated().size());
        TestHelper.findFirst(wsInvitationUpdate.getUpdated(), Project.class);
        TestHelper.findFirst(wsInvitationUpdate.getUpdated(), TeamMember.class);

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Fetch e-mail and extract the token
        ////////////////////////////////////////////////////////////////////////////////////////////
        List<Message> messages = TestHelper.getMessageByRecipient(mailClient, mateAddress);
        Assertions.assertEquals(1, messages.size());
        Message invitation = messages.get(0);

        Matcher matcher = TestHelper.extractToken(invitation);
        Assertions.assertTrue(matcher.matches()); //

        Long tokenId = Long.parseLong(matcher.group(1));
        String plainToken = matcher.group(2);
        this.mailClient.deleteMessage(invitation.getId());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // With its own http client 'borschClient', Georges fetch the token
        ////////////////////////////////////////////////////////////////////////////////////////////
        ColabClient borschClient = this.createRestClient();
        Token token = borschClient.tokenRestEndpoint.getToken(tokenId);

        Assertions.assertTrue(token instanceof InvitationToken);

        Assertions.assertTrue(token.isAuthenticationRequired());

        // an try to consume the token being unauthenticated
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.AUTHENTICATION_REQUIRED, () -> {
            // consuming the token without being authenticated is not possible
            borschClient.tokenRestEndpoint.consumeToken(tokenId, plainToken);
        });

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Georges sign up as borschsensei and subscribes to its channel with wsBorschClient
        ////////////////////////////////////////////////////////////////////////////////////////////
        TestUser mateUser = this.signup("borschsensei", mateAddress, "SoSoSoSecure");
        signIn(borschClient, mateUser);
        WebsocketClient wsBorschClient = this.createWsClient();
        borschClient.websocketRestEndpoint.subscribeToUserChannel(wsBorschClient.getSessionId());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Borsch consumes the tokens amd, thus, join the team.
        // Borsch and Goulash both receive the temmMember and borsch's user update.
        ////////////////////////////////////////////////////////////////////////////////////////////
        borschClient.tokenRestEndpoint.consumeToken(tokenId, plainToken);

        WsUpdateMessage goulashTeamUpdate = TestHelper.waitForMessagesAndAssert(
            wsGoulashClient, 1, 5, WsUpdateMessage.class).get(0);
        WsUpdateMessage borschTeamUpdate = TestHelper
            .waitForMessagesAndAssert(wsBorschClient, 1, 5, WsUpdateMessage.class).get(0);

        Assertions.assertEquals(2, goulashTeamUpdate.getUpdated().size());
        Assertions.assertEquals(2, borschTeamUpdate.getUpdated().size());

        TeamMember gTeamMemeber = TestHelper.findFirst(goulashTeamUpdate.getUpdated(),
            TeamMember.class);
        TeamMember bTeamMember = TestHelper.findFirst(borschTeamUpdate.getUpdated(),
            TeamMember.class);

        ////////////////////////////////////////////////////////////////////////////////////////////
        // They both reload the team from REST method
        ////////////////////////////////////////////////////////////////////////////////////////////
        reloadTwoMembersTeam(client, projectId);
        reloadTwoMembersTeam(borschClient, projectId);
    }

    private void reloadTwoMembersTeam(ColabClient client, Long projectId) {
        List<TeamMember> members = client.projectRestEndpoint.getMembers(projectId);
        Assertions.assertEquals(2, members.size());

        // assert currentUser can read user of teammate
        members.forEach((TeamMember member) -> {
            User u = client.userRestEndpoint.getUserById(member.getUserId());
            Assertions.assertNotNull(u);
        });

        // assert currentuser can not read other users
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.userRestEndpoint.getUserById(this.adminUserId);
        });
    }

    @Test
    public void testRoleCreation() {
        TestUser user = this.signup("goulashsensei", "goulash@test.local", "SoSecure");
        this.signIn(user);

        Project project = ColabFactory.createProject(client,
            "The Hitchhiker's Guide to the Serious-Game");
        TeamRole paranoidAndroid = ColabFactory.createRole(client, project, "paranoid android");
        TeamRole hitchhicker = ColabFactory.createRole(client, project, "Hitchhiker");

        List<TeamRole> roles = client.projectRestEndpoint.getRoles(project.getId());

        TestHelper.assertEquals(roles, Set.of(paranoidAndroid, hitchhicker));

        List<TeamMember> members = client.projectRestEndpoint.getMembers(project.getId());
        TeamMember me = members.get(0);

        Assertions.assertTrue(me.getRoleIds().isEmpty());
        client.teamRestEndpoint.giveRoleTo(hitchhicker.getId(), me.getId());

        me = client.teamRestEndpoint.getTeamMember(me.getId());
        hitchhicker = client.teamRestEndpoint.getRole(hitchhicker.getId());

        TestHelper.assertEquals(Set.of(hitchhicker.getId()), me.getRoleIds());
        TestHelper.assertEquals(Set.of(me.getId()), hitchhicker.getMemberIds());
    }

    @Test
    public void testFileWorkspace() {
        Project projectOne = ColabFactory.createProject(client, "Project One");

        String fileContent = client.projectRestEndpoint.touchFile(projectOne.getId(), "MyFile", "MyData");
        Assertions.assertEquals("MyData", fileContent);

        String readContent = client.projectRestEndpoint.getFileContent(projectOne.getId(), "MyFile");
        Assertions.assertEquals(fileContent, readContent);

        String otherContent = client.projectRestEndpoint.touchFile(projectOne.getId(), "OtherFile", "OtherData");
        Assertions.assertEquals("OtherData", otherContent);

        String readOtherContent = client.projectRestEndpoint.getFileContent(projectOne.getId(), "OtherFile");
        Assertions.assertEquals(otherContent, readOtherContent);

        Project projectTwo = ColabFactory.createProject(client, "Project Two");
        String readContentInTwo = client.projectRestEndpoint.getFileContent(projectTwo.getId(), "MyFile");
        Assertions.assertNull(readContentInTwo);

        String fileContentInTwo = client.projectRestEndpoint.touchFile(projectTwo.getId(), "MyFile", "MyDataTwo");
        Assertions.assertEquals("MyDataTwo", fileContentInTwo);

        readContentInTwo = client.projectRestEndpoint.getFileContent(projectTwo.getId(), "MyFile");
        Assertions.assertEquals(fileContentInTwo, readContentInTwo);

        readContent = client.projectRestEndpoint.getFileContent(projectOne.getId(), "MyFile");
        Assertions.assertEquals(fileContent, readContent);
    }
}
