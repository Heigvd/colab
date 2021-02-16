/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.Project;
import ch.colabproject.colab.api.tests.AbstractArquillianTest;
import org.eu.ingwar.tools.arquillian.extension.suite.annotations.ArquillianSuiteDeployment;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 * @author maxence
 */
@ArquillianSuiteDeployment
public class ProjectFacadeTest extends AbstractArquillianTest {

    @Test
    public void testCreateProject() {
        Project project = new Project();

        Project persistedProject = projectFacade.createProject(project);
        Assertions.assertNotNull(persistedProject);
        Assertions.assertNotNull(persistedProject.getId());

        Project foundProject = projectFacade.getProject(persistedProject.getId());

        Assertions.assertNotNull(foundProject);
        Assertions.assertEquals(persistedProject.getId(), foundProject.getId());
    }

}
