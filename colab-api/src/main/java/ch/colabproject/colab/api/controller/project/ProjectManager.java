/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.project;

import ch.colabproject.colab.api.controller.DuplicationManager;
import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.card.CardManager;
import ch.colabproject.colab.api.controller.card.CardTypeManager;
import ch.colabproject.colab.api.controller.document.ResourceReferenceSpreadingHelper;
import ch.colabproject.colab.api.controller.security.SecurityManager;
import ch.colabproject.colab.api.controller.team.TeamManager;
import ch.colabproject.colab.api.model.DuplicationParam;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.project.ProjectDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Project specific logic
 *
 * @author maxence
 * @author sandra
 */
@Stateless
@LocalBean
public class ProjectManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ProjectManager.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * To control access
     */
    @Inject
    private SecurityManager securityManager;

    /**
     * Request management
     */
    @Inject
    private RequestManager requestManager;

    /**
     * Project persistence handler
     */
    @Inject
    private ProjectDao projectDao;

    /**
     * Team specific logic management
     */
    @Inject
    private TeamManager teamManager;

    /**
     * Card specific logic management
     */
    @Inject
    private CardManager cardManager;

    /**
     * Card type specific logic management
     */
    @Inject
    private CardTypeManager cardTypeManager;

    /**
     * Resource reference spreading specific logic handling
     */
    @Inject
    private ResourceReferenceSpreadingHelper resourceReferenceSpreadingHelper;

    // *********************************************************************************************
    // find projects
    // *********************************************************************************************

    /**
     * Retrieve the project. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param projectId the id of the project
     *
     * @return the project if found
     *
     * @throws HttpErrorMessage if the project was not found
     */
    public Project assertAndGetProject(Long projectId) {
        Project project = projectDao.findProject(projectId);

        if (project == null) {
            logger.error("project #{} not found", projectId);
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return project;
    }

    /**
     * Retrieve all projects the current user is member of
     *
     * @return list of matching projects
     */
    public List<Project> findProjectsOfCurrentUser() {
        User user = securityManager.assertAndGetCurrentUser();

        List<Project> projects = projectDao.findProjectsUserIsMemberOf(user.getId());

        logger.debug("found projects where the user {} is a team member : {}", user, projects);

        return projects;
    }

    // *********************************************************************************************
    // life cycle
    // *********************************************************************************************

    /**
     * Complete and persist the given project and add the current user to the project team
     *
     * @param project project to persist
     *
     * @return the new persisted project
     */
    public Project createProject(Project project) {
        try {
            return requestManager.sudo(() -> {
                logger.debug("Create project: {}", project);

                initProject(project);

                return projectDao.persistProject(project);
            });
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            return null;
        }
    }

    /**
     * Initialize the project with a root card (if it does not have already one) and set the current
     * user as a team member owner of the project
     *
     * @param project the project to fill
     */
    private void initProject(Project project) {
        if (project.getRootCard() == null) {
            Card rootCard = cardManager.initNewRootCard();

            project.setRootCard(rootCard);
            rootCard.setRootCardProject(project);
        }

        User user = securityManager.assertAndGetCurrentUser();
        Optional<TeamMember> currentUserTeamMember = project.getTeamMembers().stream()
            .filter(tm -> tm.getUserId() == user.getId()).findFirst();
        if (currentUserTeamMember.isPresent()) {
            currentUserTeamMember.get().setPosition(HierarchicalPosition.OWNER);
        } else {
            teamManager.addMember(project, user, HierarchicalPosition.OWNER);
        }
    }

    /**
     * Create a new project based on a model
     *
     * @param name        the name of the new project
     * @param description the description of the new project
     * @param modelId     the id of the model the new project is based on
     *
     * @return the new project
     */
    public Project createProjectFromModel(String name, String description, Long modelId) {
        try {
            return requestManager.sudo(() -> {
                Project project = duplicateProject(modelId,
                    DuplicationParam.buildForCreationFromModel());

                project.setName(name);
                project.setDescription(description);

                return project;
            });
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            return null;
        }
    }

    // *********************************************************************************************
    // duplication
    // *********************************************************************************************

    /**
     * Duplicate the given project with the given parameters to fine tune the duplication
     *
     * @param projectId the id of the project to duplicate
     * @param params    the parameters to fine tune the duplication
     *
     * @return the new project
     */
    public Project duplicateProject(Long projectId, DuplicationParam params) {
        Project originalProject = assertAndGetProject(projectId);

        Project newProject = new DuplicationManager(params).duplicateProject(originalProject,
            resourceReferenceSpreadingHelper);

        return createProject(newProject);
    }

    // *********************************************************************************************
    // retrieve the elements of a project
    // *********************************************************************************************

    /**
     * Get the root card of the given project
     *
     * @param projectId the id of the project
     *
     * @return The root card linked to the project
     */
    public Card getRootCard(Long projectId) {
        logger.debug("get the root card of the project #{}", projectId);

        Project project = assertAndGetProject(projectId);

        return project.getRootCard();
    }

    /**
     * Get all cards of the given project
     *
     * @param projectId the id of the project
     *
     * @return all cards of the project
     */
    public Set<Card> getCards(Long projectId) {
        logger.debug("get all card of project #{}", projectId);

        Project project = assertAndGetProject(projectId);

        return cardManager.getAllCards(project.getRootCard());
    }

    /**
     * Get all cardContents of the given project
     *
     * @param projectId the id of the project
     *
     * @return all cards contents of the project
     */
    public Set<CardContent> getCardContents(Long projectId) {
        logger.debug("get all card contents of project #{}", projectId);

        Project project = assertAndGetProject(projectId);

        return cardManager.getAllCardContents(project.getRootCard());
    }

    /**
     * Get all card types of the given project
     *
     * @param projectId the id of the project
     *
     * @return all card types of the project
     */
    public Set<AbstractCardType> getCardTypes(Long projectId) {
        logger.debug("get card types of project #{}", projectId);

        Project project = assertAndGetProject(projectId);

        return cardTypeManager.getExpandedProjectTypes(project);
    }

    /**
     * Get all activity flow links belonging to the given project
     *
     * @param projectId the id of the project
     *
     * @return all activityFlowLinks linked to the project
     */
    public Set<ActivityFlowLink> getActivityFlowLinks(Long projectId) {
        logger.debug("Get activity flow links of project #{}", projectId);

        Project project = assertAndGetProject(projectId);

        return cardManager
            .getAllCards(project.getRootCard())
            .stream().flatMap(card -> {
                return card.getActivityFlowLinksAsPrevious().stream();
            }).collect(Collectors.toSet());
    }

    // *********************************************************************************************
    // dedicated to access control
    // *********************************************************************************************

    /**
     * Retrieve the ids of the projects the current user is a member of.
     * <p>
     * We do not load the java objects. Just work with the ids. Two reasons : 1. the ids are enough,
     * so it is lighter + 2. prevent from loading object the user is not allowed to read
     *
     * @return the ids of the matching projects
     */
    public List<Long> findIdsOfProjectsOfCurrentUser() {
        User user = securityManager.assertAndGetCurrentUser();

        List<Long> projectsIds = projectDao.findIdsOfProjectUserIsMemberOf(user.getId());

        logger.debug("found projects' id where the user {} is a team member : {}", user,
            projectsIds);

        return projectsIds;
    }

    /**
     * Retrieve the ids of the project for which the current user can read at least one local card
     * type or reference
     * <p>
     * We do not load the java objects. Just work with the ids. Two reasons : 1. the ids are enough,
     * so it is lighter + 2. prevent from loading object the user is not allowed to read
     *
     * @return the ids of the matching projects
     */
    public List<Long> findIdsOfProjectsReadableThroughCardTypes() {
        List<Long> cardTypeOrRefIds = cardTypeManager.findCurrentUserReadableProjectsCardTypesIds();

        List<Long> projectsIds = cardTypeManager.findProjectIdsFromCardTypeIds(cardTypeOrRefIds);

        logger.debug("found projects from readable card types {} : {}", cardTypeOrRefIds,
            projectsIds);

        return projectsIds;
    }

    // *********************************************************************************************
    // integrity check
    // *********************************************************************************************

    /**
     * Check the integrity of the project
     *
     * @param project the project to check
     *
     * @return true iff the project is complete and safe
     */
    public boolean checkIntegrity(Project project) {
        if (project == null) {
            return false;
        }

        if (project.getRootCard() == null) {
            return false;
        }

        List<TeamMember> teamMembers = new ArrayList<>(project.getTeamMembers());
        if (teamMembers.stream().noneMatch(m -> m.getPosition() == HierarchicalPosition.OWNER)) {
            return false;
        }

        return true;
    }

}
