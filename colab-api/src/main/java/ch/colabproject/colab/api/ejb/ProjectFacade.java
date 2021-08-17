/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.project.ProjectDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import java.util.Set;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Some project logic
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class ProjectFacade {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ProjectFacade.class);

    /**
     * To control access
     */
    @Inject
    private SecurityFacade securityFacade;

    /**
     * To control access
     */
    @Inject
    private RequestManager requestManager;

    /**
     * Project persistence
     */
    @Inject
    private ProjectDao projectDao;

    /** Team management */
    @Inject
    private TeamFacade teamFacade;

    /**
     * Cards-related logic
     */
    @Inject
    private CardFacade cardFacade;

    // *********************************************************************************************
    // pure projects
    // *********************************************************************************************
    /**
     * Get all projects the current user is member of
     *
     * @return list of projects
     */
    public List<Project> getCurrentUserProject() {
        User user = securityFacade.assertAndGetCurrentUser();
        return projectDao.getUserProject(user.getId());
    }

    /**
     * Persist the given project and add the current user to the project team
     *
     * @param project project to persist
     *
     * @return the new persisted project
     */
    public Project createNewProject(Project project) {
        try {
            return requestManager.sudo(() -> {
                logger.debug("Create new project: {}", project);
                Card rootCard = cardFacade.initNewRootCard();
                project.setRootCard(rootCard);
                rootCard.setRootCardProject(project);

                User user = securityFacade.assertAndGetCurrentUser();
                teamFacade.addMember(project, user, HierarchicalPosition.OWNER);

                return projectDao.createProject(project);
            });
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            return null;
        }
    }

    // *********************************************************************************************
    // cards
    // *********************************************************************************************
    /**
     * Get all card types of the given project
     *
     * @param projectId id of the project
     *
     * @return all card types of the project
     */
    public Set<AbstractCardType> getCardTypes(Long projectId) {
        Project project = projectDao.getProject(projectId);
        logger.debug("Get card types of project {}", project);
        if (project == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return cardFacade.getExpandedProjectType(project);
    }

}
