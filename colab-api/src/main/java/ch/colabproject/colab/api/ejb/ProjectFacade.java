/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.controller.card.CardTypeManager;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.project.ProjectDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.ArrayList;
import java.util.List;
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
public class ProjectFacade {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ProjectFacade.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * To control access
     */
    @Inject
    private SecurityFacade securityFacade;

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
    private TeamFacade teamManager;

    /**
     * Card specific logic management
     */
    @Inject
    private CardFacade cardManager;

    /**
     * Card type specific logic management
     */
    @Inject
    private CardTypeManager cardTypeManager;

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
        Project project = projectDao.getProject(projectId);

        if (project == null) {
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
        User user = securityFacade.assertAndGetCurrentUser();

        List<Project> projects = projectDao.getUserProject(user.getId());

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

                Card rootCard = cardManager.initNewRootCard();

                project.setRootCard(rootCard);
                rootCard.setRootCardProject(project);

                User user = securityFacade.assertAndGetCurrentUser();
                teamManager.addMember(project, user, HierarchicalPosition.OWNER);

                return projectDao.createProject(project);
            });
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            return null;
        }
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
        User user = securityFacade.assertAndGetCurrentUser();

        List<Long> projectsIds = projectDao.getIdsOfProjectUserIsMemberOf(user.getId());

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
        if (teamMembers == null
            || teamMembers.stream().noneMatch(m -> m.getPosition() == HierarchicalPosition.OWNER)) {
            return false;
        }

        return true;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
