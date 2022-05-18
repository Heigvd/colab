/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.project;

import ch.colabproject.colab.api.controller.project.ProjectManager;
import ch.colabproject.colab.api.controller.team.TeamManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.DuplicationParam;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.persistence.jpa.project.ProjectDao;
import ch.colabproject.colab.api.rest.project.bean.ProjectCreationData;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import java.util.List;
import java.util.Set;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * REST Project controller
 *
 * @author maxence
 */
@Path("projects")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class ProjectRestEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ProjectRestEndpoint.class);

    /**
     * The Project business logic
     */
    @Inject
    private ProjectManager projectManager;

    /** TeamMembers and roles management */
    @Inject
    private TeamManager teamManager;

    /**
     * The Project DAO
     */
    @Inject
    private ProjectDao projectDao;

    /**
     * Retrieve the list of all projects. This is available to admin only
     *
     * @return all known project
     */
    @GET
    @AdminResource
    public List<Project> getAllProjects() {
        logger.debug("Get all projects");
        return projectDao.findAllProject();
    }

    /**
     * Get all projects the current user is member of
     *
     * @return list of projects
     */
    @GET
    @Path("MyOwn")
    public List<Project> getUserProjects() {
        logger.debug("Get user projects");
        return projectManager.findProjectsOfCurrentUser();
    }

    /**
     * Get project identified by the given id.
     *
     * @param id id of the project to fetch
     *
     * @return the project or null
     */
    @GET
    @Path("/{id}")
    public Project getProject(@PathParam("id") Long id) {
        logger.debug("Get project #{}", id);
        return projectDao.findProject(id);
    }

    /**
     * Create a new project with the provided data and register current user as a member.
     *
     * @param creationData the data needed to fill the project
     *
     * @return id of the persisted new project
     */
    @POST
    @Path("createWithModel")
    public Long createProject(ProjectCreationData creationData) {
        logger.debug("Create a project with {}", creationData);

        Project project;

        if (creationData.getModelId() == null) {
            project = new Project();
            project.setName(creationData.getName());
            project.setDescription(creationData.getDescription());
            projectManager.createProject(project);
        } else {
            project = projectManager.createProjectFromModel(creationData.getName(),
                creationData.getDescription(), creationData.getModelId());
        }

        creationData.getGuestsEmail().stream().forEach(email -> {
            teamManager.invite(project.getId(), email);
        });

        return project.getId();
    }

    /**
     * Save changes to database.
     *
     * @param project project to update
     *
     * @throws ColabMergeException if the merge is not possible
     */
    @PUT
    public void updateProject(Project project) throws ColabMergeException {
        logger.debug("Update project {}", project);
        projectDao.updateProject(project);
    }

    /**
     * Permanently delete a project.
     *
     * @param id id of the project to delete
     */
    @DELETE
    @Path("/{id}")
    public void deleteProject(@PathParam("id") Long id) {
        logger.debug("Delete project #{}", id);
        projectManager.deleteProject(id);
    }

    /**
     * Duplicate the given project
     *
     * @param projectId the id of the project we want to duplicate
     * @param params    the parameters to fine tune
     *
     * @return the id of the duplicated project
     */
    @PUT
    @Path("copyProject/{id}")
    public Long duplicateProject(@PathParam("id") Long projectId, DuplicationParam params) {
        logger.debug("duplicate the project #{} with params {}", projectId, params);

        DuplicationParam effectiveParams = params;
        if (effectiveParams == null) {
            effectiveParams = DuplicationParam.buildDefaultForCopyOfProject();
        }

        return projectManager.duplicateProject(projectId, effectiveParams).getId();
    }

    /**
     * Get the root card of the project
     *
     * @param projectId the id of the project
     *
     * @return the matching card
     */
    @GET
    @Path("{projectId}/RootCard")
    public Card getRootCardOfProject(@PathParam("projectId") Long projectId) {
        logger.debug("get the root card of the project #{}", projectId);
        return projectManager.getRootCard(projectId);
    }

    /**
     * Get all members of the project teams.
     *
     * @param id id of the project
     *
     * @return list of members
     */
    @GET
    @Path("{id}/Members")
    public List<TeamMember> getMembers(@PathParam("id") Long id) {
        logger.debug("Get project #{} members", id);
        return teamManager.getTeamMembers(id);
    }

    /**
     * Get all roles defined in a project
     *
     * @param projectId projectId of the project
     *
     * @return list of roles
     */
    @GET
    @Path("{projectId: [0-9]+}/roles")
    public List<TeamRole> getRoles(@PathParam("projectId") Long projectId) {
        logger.debug("Get project #{} members", projectId);
        return teamManager.getProjectRoles(projectId);
    }

    /**
     * Get all card types belonging to a project
     *
     * @param id ID of the project the card types belong to
     *
     * @return the card types linked to the project
     */
    @GET
    @Path("{id}/CardTypes")
    public Set<AbstractCardType> getCardTypesOfProject(@PathParam("id") Long id) {
        logger.debug("Get project #{} card types", id);
        return projectManager.getCardTypes(id);
    }

    /**
     * Get all cards belonging to a project
     *
     * @param id ID of the project the cards belong to
     *
     * @return the cards linked to the project
     */
    @GET
    @Path("{id}/Cards")
    public Set<Card> getCardsOfProject(@PathParam("id") Long id) {
        logger.debug("Get project #{} cards", id);
        return projectManager.getCards(id);
    }

    /**
     * Get all cardContents belonging to a project
     *
     * @param id ID of the project the cardContents belong to
     *
     * @return the cardContents linked to the project
     */
    @GET
    @Path("{id}/CardContents")
    public Set<CardContent> getCardContentsOfProject(@PathParam("id") Long id) {
        logger.debug("Get project #{} cardContents", id);
        return projectManager.getCardContents(id);
    }

    /**
     * Get all activityflowlinks belonging to a project
     *
     * @param id ID of the project activityflowlinks belong to
     *
     * @return all activityFlowLinks linked to the project
     */
    @GET
    @Path("{id}/ActivityFlowLink")
    public Set<ActivityFlowLink> getActivityFlowLinks(@PathParam("id") Long id) {
        logger.debug("Get project #{} activityflowlinks", id);
        return projectManager.getActivityFlowLinks(id);
    }

}
