/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.ejb.ProjectFacade;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.CardDef;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.persistence.card.CardDefDao;
import ch.colabproject.colab.api.persistence.project.ProjectDao;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import java.util.List;
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
public class ProjectController {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ProjectController.class);

    /**
     * The Project business logic
     */
    @Inject
    private ProjectFacade projectFacade;

    /**
     * The Project DAO
     */
    @Inject
    private ProjectDao projectDao;

    /**
     * Card definition persistence
     */
    @Inject
    private CardDefDao cardDefDao;

    /**
     * Retrieve the list of all projects. This is available to admin only
     *
     * @return all known project
     */
    @GET
    @AdminResource
    public List<Project> getAllProjects() {
        logger.debug("Get all projects");
        return projectDao.getAllProject();
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
        return projectFacade.getCurrentUserProject();
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
        return projectDao.getProject(id);
    }

    /**
     * Create a new project and register current user as a member.
     *
     * @param project the project to persist
     *
     * @return id of the persisted new project
     */
    @POST
    public Long createProject(Project project) {
        logger.debug("Create project {}", project);
        return projectFacade.createNewProject(project).getId();
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
        projectDao.deleteProject(id);
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
        return projectFacade.getTeamMembers(id);
    }

    /**
     * Send invitation to someone.
     *
     * @param projectId id of the project
     * @param email recipient address
     */
    @POST
    @Path("Invite/{projectId: [0-9]}/{email}")
    public void inviteSomeone(@PathParam("projectId") Long projectId,
            @PathParam("email") String email) {
        logger.debug("Invite {} to joint project #{}", email, projectId);
        projectFacade.invite(projectId, email);
    }

    /**
     * Get all card definitions belonging to a project
     *
     * @param id ID of the project the card definitions belong to
     *
     * @return the card definitions linked to the project
     */
    @GET
    @Path("{id}/CardDefs")
    public List<CardDef> getCardDefsOfProject(@PathParam("id") Long id) {
        logger.debug("Get project #{} card definitions", id);
        return cardDefDao.getProjectCardDefs(id);
        // an alternative would be to define a method in the facade
        // projectDao.getProject(id).getElementsToBeDefined()
        // FIXME see what is the best
    }
}
