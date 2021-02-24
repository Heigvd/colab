/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.tests.AbstractArquillianTest;
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

        Long projectId = projectController.createProject(project);
        Project persistedProject = projectController.getProject(projectId);

        Assertions.assertNotNull(persistedProject);
        Assertions.assertNotNull(persistedProject.getId());

        Assertions.assertEquals(persistedProject.getId(), projectId);
    }

    @Test
    public void testDeleteProject() {
        Project project = new Project();
        Long projectId = projectController.createProject(project);
        Project persistedProject = projectController.getProject(projectId);

        Assertions.assertNotNull(persistedProject);

        projectController.deleteProject(projectId);
        persistedProject = projectController.getProject(projectId);

        Assertions.assertNull(persistedProject);
    }

}
