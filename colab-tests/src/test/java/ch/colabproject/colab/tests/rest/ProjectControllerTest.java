/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest;

import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.token.InvitationToken;
import ch.colabproject.colab.api.model.token.Token;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.tests.mailhog.model.Message;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.TestHelper;
import ch.colabproject.colab.tests.tests.TestUser;
import java.util.List;
import java.util.regex.Matcher;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 * @author maxence
 */
public class ProjectControllerTest extends AbstractArquillianTest {

    @Test
    public void testCreateProject() {
        TestUser user = this.signup("goulashsensei", "goulash@test.local", "SoSecure");
        this.signIn(user);

        User currentUser = client.userController.getCurrentUser();

        Project project = new Project();

        Long projectId = client.projectController.createProject(project);
        Project persistedProject = client.projectController.getProject(projectId);

        Assertions.assertNotNull(persistedProject);
        Assertions.assertNotNull(persistedProject.getId());

        Assertions.assertEquals(persistedProject.getId(), projectId);

        List<TeamMember> members = client.projectController.getMembers(projectId);
        Assertions.assertEquals(1, members.size());

        TeamMember me = members.get(0);
        Assertions.assertEquals(currentUser.getId(), me.getUserId());
        Assertions.assertEquals(projectId, me.getProjectId());
    }

    @Test
    public void testUpdateProject() {
        Project project = new Project();

        Long projectId = client.projectController.createProject(project);
        project = client.projectController.getProject(projectId);
        project.setName("The Hitchhiker's Guide to the Serious-Game");

        client.projectController.updateProject(project);

        Project project2 = client.projectController.getProject(projectId);
        Assertions.assertEquals(project.getName(), project2.getName());
    }

    @Test
    public void testGetAllProjects() {
        Project project = new Project();
        project.setName("The Hitchhiker's Guide to the Serious-Game");
        client.projectController.createProject(project);

        project = new Project();
        project.setName("Don't Panic");
        client.projectController.createProject(project);

        List<Project> projects = client.projectController.getAllProjects();
        Assertions.assertEquals(2, projects.size());
    }

    @Test
    public void testDeleteProject() {
        Project project = new Project();
        Long projectId = client.projectController.createProject(project);
        Project persistedProject = client.projectController.getProject(projectId);

        Assertions.assertNotNull(persistedProject);

        client.projectController.deleteProject(projectId);
        persistedProject = client.projectController.getProject(projectId);

        Assertions.assertNull(persistedProject);
    }

    @Test
    public void testInvite() {
        TestUser user = this.signup("goulashsensei", "goulash@test.local", "SoSecure");
        String mateAddress = "georges@valgeorges.local";

        this.signIn(user);

        Project p = new Project();
        p.setName("The Hitchhiker's Guide to the Serious-Game");

        Long projectId = client.projectController.createProject(p);
        Project project = client.projectController.getProject(projectId);

        // user is a lonely team member
        List<TeamMember> members = client.projectController.getMembers(project.getId());
        Assertions.assertEquals(1, members.size());

        mailClient.deleteAllMessages();
        client.projectController.inviteSomeone(projectId, mateAddress);

        List<Message> messages = getMessageByRecipient(mateAddress);
        Assertions.assertEquals(1, messages.size());
        Message invitation = messages.get(0);

        Matcher matcher = TOKEN_EXTRACTOR.matcher(invitation.getContent().getBody());
        Assertions.assertTrue(matcher.matches());

        Long tokenId = Long.parseLong(matcher.group(1));
        String plainToken = matcher.group(2);

        this.signOut();

        Token token = client.tokenController.getToken(tokenId);

        Assertions.assertTrue(token instanceof InvitationToken);

        Assertions.assertTrue(token.isAuthenticationRequired());

        TestHelper.assertThrows(HttpErrorMessage.MessageCode.AUTHENTICATION_REQUIRED, () -> {
            // consuming the token without being authenticated is not possible
            client.tokenController.consumeToken(tokenId, plainToken);
        });

        TestUser mateUser = this.signup("borschsensei", mateAddress, "SoSoSoSecure");
        this.signIn(mateUser);
        client.tokenController.consumeToken(tokenId, plainToken);
        this.mailClient.deleteMessage(invitation.getId());

        // not lonely anylonger
        members = client.projectController.getMembers(project.getId());
        Assertions.assertEquals(2, members.size());
    }
}
