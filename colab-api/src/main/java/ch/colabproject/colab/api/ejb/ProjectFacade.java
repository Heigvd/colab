/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jcr.JcrSession;
import ch.colabproject.colab.api.persistence.jcr.JcrSessionManager;
import ch.colabproject.colab.api.persistence.jpa.project.ProjectDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
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

    /**
     * to get session to workspace
     */
    @Inject
    private JcrSessionManager jcrSessionManager;

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
     * Get all cards of the given project
     *
     * @param projectId id of the project
     *
     * @return all cards of the project
     */
    public Set<Card> getCards(Long projectId) {
        Project project = projectDao.getProject(projectId);
        logger.debug("Get card types of project {}", project);
        if (project == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return cardFacade.getAllCards(project.getRootCard());
    }

    /**
     * Get all cardContents of the given project
     *
     * @param projectId id of the project
     *
     * @return all cards contents of the project
     */
    public Set<CardContent> getCardContents(Long projectId) {
        Project project = projectDao.getProject(projectId);
        logger.debug("Get card types of project {}", project);
        if (project == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return cardFacade.getAllCardContents(project.getRootCard());
    }

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

    /**
     * Get all activityflowlinks belonging to a project
     *
     * @param projectId ID of the project activityflowlinks belong to
     *
     * @return all activityFlowLinks linked to the project
     */
    public Set<ActivityFlowLink> getActivityFlowLinks(Long projectId) {
        Project project = projectDao.getProject(projectId);
        logger.debug("Get activityflowlinks of project {}", project);
        if (project == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return cardFacade
            .getAllCards(project.getRootCard())
            .stream().flatMap(card -> {
                return card.getActivityFlowLinksAsPrevious().stream();
            }).collect(Collectors.toSet());
    }

    /**
     * Touch a file in project workspace
     *
     * @param projectId id of the project
     * @param name      name of the node/file to create
     * @param content   node data content
     *
     * @return persisted data content
     */
    public String touchFile(Long projectId, String name, String content) {
        Project project = projectDao.getProject(projectId);

        try {
            JcrSession session = jcrSessionManager.getSession(project);

            Node node;
            if (session.nodeExists(name)) {
                node = session.getNode(name);
            } else {
                Node root = session.getWorkspaceRoot();
                root.addNode(name);
                node = session.getNode(name);
            }

            node.setProperty("data", content);
            return node.getProperty("data").getString();
        } catch (RepositoryException ex) {
            logger.error("Error: {}", ex);
            return null;
        }
    }

    /**
     * Get a file in project workspace
     *
     * @param projectId id of the project
     * @param name      name of the file
     *
     * @return data content
     *
     */
    public String getFile(Long projectId, String name) {
        Project project = projectDao.getProject(projectId);

        try {
            JcrSession session = jcrSessionManager.getSession(project);
            Node node;
            if (session.nodeExists(name)) {
                node = session.getNode(name);
                Property property = node.getProperty("data");
                return property.getString();
            } else {
                return null;
            }

        } catch (RepositoryException ex) {
            logger.error("Error: {}", ex);
            return null;
        }
    }
}
