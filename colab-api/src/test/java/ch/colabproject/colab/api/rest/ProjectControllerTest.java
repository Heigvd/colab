/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.tests.AbstractArquillianTest;
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

        Long projectId = client.createProject(project);
        Project persistedProject = client.getProject(projectId);

        Assertions.assertNotNull(persistedProject);
        Assertions.assertNotNull(persistedProject.getId());

        Assertions.assertEquals(persistedProject.getId(), projectId);
    }

    @Test
    public void testUpdateProject() {
        Project project = new Project();

        Long projectId = client.createProject(project);
        project = client.getProject(projectId);
        project.setName("The Hitchhiker's Guide to the Serious-Game");

        client.updateProject(project);

        Project project2 = client.getProject(projectId);
        Assertions.assertEquals(project.getName(), project2.getName());
    }

    @Test
    public void testGetAllProjects() {
        Project project = new Project();
        project.setName("The Hitchhiker's Guide to the Serious-Game");
        client.createProject(project);

        project = new Project();
        project.setName("Don't Panic");
        client.createProject(project);

        List<Project> projects = client.getAllProject();
        Assertions.assertEquals(2, projects.size());
    }

    @Test
    public void testDeleteProject() {
        Project project = new Project();
        Long projectId = client.createProject(project);
        Project persistedProject = client.getProject(projectId);

        Assertions.assertNotNull(persistedProject);

        client.deleteProject(projectId);
        persistedProject = client.getProject(projectId);

        Assertions.assertNull(persistedProject);
    }

}
