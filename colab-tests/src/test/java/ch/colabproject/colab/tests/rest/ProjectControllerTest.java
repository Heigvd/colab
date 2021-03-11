/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest;

import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 * @author maxence
 */
public class ProjectControllerTest extends AbstractArquillianTest {

    @Test
    public void testCreateProject() {
        Project project = new Project();

        Long projectId = client.projectController.createProject(project);
        Project persistedProject = client.projectController.getProject(projectId);

        Assertions.assertNotNull(persistedProject);
        Assertions.assertNotNull(persistedProject.getId());

        Assertions.assertEquals(persistedProject.getId(), projectId);
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

}
