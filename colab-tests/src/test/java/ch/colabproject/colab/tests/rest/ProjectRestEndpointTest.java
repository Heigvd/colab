/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.common.IconLibrary;
import ch.colabproject.colab.api.model.common.Illustration;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.project.ProjectType;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.token.InvitationToken;
import ch.colabproject.colab.api.model.token.Token;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.rest.project.bean.ProjectCreationData;
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
 * @author sandra
 */
public class ProjectRestEndpointTest extends AbstractArquillianTest {

    @Test
    public void testCreateDeleteProject() {
        ProjectType type = ProjectType.PROJECT;
        String name = "my first new project";
        String description = "everything is awesome";
        IconLibrary iconLibrary = IconLibrary.FONT_AWESOME_SOLID;
        String iconKey = "otter";
        String iconBkgdColor = "#936";

        TestUser user = this.signup("goulashsensei", "goulash@test.local", "SoSecure");
        this.signIn(user);

        User currentUser = client.userRestEndpoint.getCurrentUser();

        ProjectCreationData project = new ProjectCreationData();
        project.setType(type);
        project.setName(name);
        project.setDescription(description);
        Illustration illustration = new Illustration();
        illustration.setIconLibrary(iconLibrary);
        illustration.setIconKey(iconKey);
        illustration.setIconBkgdColor(iconBkgdColor);
        project.setIllustration(illustration);

        Long projectId = client.projectRestEndpoint.createProject(project);

        Project persistedProject = client.projectRestEndpoint.getProject(projectId);
        Assertions.assertNotNull(persistedProject);
        Assertions.assertNotNull(persistedProject.getId());
        Assertions.assertEquals(projectId, persistedProject.getId());
        Assertions.assertEquals(type, persistedProject.getType());
        Assertions.assertEquals(name, persistedProject.getName());
        Assertions.assertEquals(description, persistedProject.getDescription());
        Assertions.assertNotNull(persistedProject.getIllustration());
        Assertions.assertEquals(iconLibrary, persistedProject.getIllustration().getIconLibrary());
        Assertions.assertEquals(iconKey, persistedProject.getIllustration().getIconKey());
        Assertions.assertEquals(iconBkgdColor,
            persistedProject.getIllustration().getIconBkgdColor());

        Card rootCard = client.projectRestEndpoint.getRootCardOfProject(projectId);
        Assertions.assertNotNull(rootCard);
        Long rootCardId = rootCard.getId();
        Assertions.assertNotNull(rootCardId);

        List<CardContent> rootCardContents = client.cardRestEndpoint
            .getContentVariantsOfCard(rootCardId);
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

        boolean wasError = false;
        try {
            rootCard = client.projectRestEndpoint.getRootCardOfProject(projectId);
        } catch (HttpErrorMessage hem) {
            Assertions.assertEquals(HttpErrorMessage.MessageCode.RELATED_OBJECT_NOT_FOUND,
                hem.getMessageCode());
            wasError = true;
        }
        if (!wasError) {
            Assertions.fail();
        }

        rootCard = client.cardRestEndpoint.getCard(rootCardId);
        Assertions.assertNull(rootCard);

        wasError = false;
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
        ProjectCreationData projectCreationData = new ProjectCreationData();
        projectCreationData.setType(ProjectType.PROJECT);

        Long projectId = client.projectRestEndpoint.createProject(projectCreationData);

        Project project = client.projectRestEndpoint.getProject(projectId);

        Assertions.assertEquals(ProjectType.PROJECT, project.getType());
        Assertions.assertNull(project.getName());
        Assertions.assertNull(project.getDescription());
        // Assertions.assertFalse(project.isGlobalProject());
        Assertions.assertNull(project.getIllustration());

        project.setType(ProjectType.MODEL);
        project.setName("The Hitchhiker's Guide to the Serious-Game");
        project.setDescription("So Long, and Thanks for All the Games");
        // project.setGlobalProject(true);
        Illustration illustration = new Illustration();
        illustration.setIconLibrary(IconLibrary.FONT_AWESOME_SOLID);
        illustration.setIconKey("faPaw");
        illustration.setIconBkgdColor("purple");
        project.setIllustration(illustration);

        client.projectRestEndpoint.updateProject(project);

        Project project2 = client.projectRestEndpoint.getProject(projectId);
        Assertions.assertEquals(project.getType(), project2.getType());
        Assertions.assertEquals(project.getName(), project2.getName());
        Assertions.assertEquals(project.getDescription(), project2.getDescription());
        // Assertions.assertTrue(project.isGlobalProject());
        Assertions.assertNotNull(project.getIllustration());
        Assertions.assertEquals(project.getIllustration().getIconLibrary(),
            project2.getIllustration().getIconLibrary());
        Assertions.assertEquals(project.getIllustration().getIconKey(),
            project2.getIllustration().getIconKey());
        Assertions.assertEquals(project.getIllustration().getIconBkgdColor(),
            project2.getIllustration().getIconBkgdColor());
    }

    @Test
    public void testGetAllProjects() {
        ProjectCreationData project = new ProjectCreationData();
        project.setType(ProjectType.PROJECT);
        project.setName("The Hitchhiker's Guide to the Serious-Game");
        client.projectRestEndpoint.createProject(project);

        project = new ProjectCreationData();
        project.setType(ProjectType.PROJECT);
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
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(WebsocketManager.class), Level.TRACE);
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
        ProjectCreationData p = new ProjectCreationData();
        p.setType(ProjectType.PROJECT);
        p.setName("The Hitchhiker's Guide to the Serious-Game");

        Long projectId = client.projectRestEndpoint.createProject(p);

        // Goulash receives the project and the teamMember which link the project to the user
        WsUpdateMessage wsProjectUpdate = TestHelper
            .waitForMessagesAndAssert(wsGoulashClient, 1, 5, WsUpdateMessage.class).get(0);
        // project, teamMember
        Assertions.assertEquals(2, wsProjectUpdate.getUpdated().size(),
            "Got " + wsProjectUpdate.getUpdated());

        Project project = TestHelper.findFirst(wsProjectUpdate.getUpdated(), Project.class);
        TeamMember member = TestHelper.findFirst(wsProjectUpdate.getUpdated(), TeamMember.class);

        Assertions.assertEquals(projectId, project.getId());
        Assertions.assertEquals(projectId, member.getProjectId());

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

        // a try to consume the token being unauthenticated
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
        // Borsch consumes the invitation tokens and, thus, join the team.
        // Borsch and Goulash both receive the temmMember update.
        ////////////////////////////////////////////////////////////////////////////////////////////
        borschClient.tokenRestEndpoint.consumeToken(tokenId, plainToken);

        WsUpdateMessage goulashTeamUpdate = TestHelper.waitForMessagesAndAssert(
            wsGoulashClient, 1, 5, WsUpdateMessage.class).get(0);
        WsUpdateMessage borschTeamUpdate = TestHelper
            .waitForMessagesAndAssert(wsBorschClient, 1, 5, WsUpdateMessage.class).get(0);

        Assertions.assertEquals(1, goulashTeamUpdate.getUpdated().size());
        Assertions.assertEquals(1, borschTeamUpdate.getUpdated().size());

        TestHelper.findFirst(goulashTeamUpdate.getUpdated(), TeamMember.class);
        TestHelper.findFirst(borschTeamUpdate.getUpdated(), TeamMember.class);

        ////////////////////////////////////////////////////////////////////////////////////////////
        // They both reload the team from REST method
        ////////////////////////////////////////////////////////////////////////////////////////////
        reloadTwoMembersTeam(client, projectId);
        reloadTwoMembersTeam(borschClient, projectId);
    }

    private void reloadTwoMembersTeam(ColabClient client, Long projectId) {
        List<TeamMember> members = client.projectRestEndpoint.getMembers(projectId);
        Assertions.assertEquals(2, members.size());

        // assert currentUser can read user of team mate
        members.forEach((TeamMember member) -> {
            User u = client.userRestEndpoint.getUserById(member.getUserId());
            Assertions.assertNotNull(u);
        });

        // assert the current user can not read other users
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

//    @Test TODO rewrite or remove
//    public void testFileWorkspace() {
//        Project projectOne = ColabFactory.createProject(client, "Project One");
//
//        String fileContent = client.projectRestEndpoint.touchFile(projectOne.getId(), "MyFile", "MyData");
//        Assertions.assertEquals("MyData", fileContent);
//
//        String readContent = client.projectRestEndpoint.getFileContent(projectOne.getId(), "MyFile");
//        Assertions.assertEquals(fileContent, readContent);
//
//        String otherContent = client.projectRestEndpoint.touchFile(projectOne.getId(), "OtherFile", "OtherData");
//        Assertions.assertEquals("OtherData", otherContent);
//
//        String readOtherContent = client.projectRestEndpoint.getFileContent(projectOne.getId(), "OtherFile");
//        Assertions.assertEquals(otherContent, readOtherContent);
//
//        Project projectTwo = ColabFactory.createProject(client, "Project Two");
//        String readContentInTwo = client.projectRestEndpoint.getFileContent(projectTwo.getId(), "MyFile");
//        Assertions.assertNull(readContentInTwo);
//
//        String fileContentInTwo = client.projectRestEndpoint.touchFile(projectTwo.getId(), "MyFile", "MyDataTwo");
//        Assertions.assertEquals("MyDataTwo", fileContentInTwo);
//
//        readContentInTwo = client.projectRestEndpoint.getFileContent(projectTwo.getId(), "MyFile");
//        Assertions.assertEquals(fileContentInTwo, readContentInTwo);
//
//        readContent = client.projectRestEndpoint.getFileContent(projectOne.getId(), "MyFile");
//        Assertions.assertEquals(fileContent, readContent);
//    }
}
