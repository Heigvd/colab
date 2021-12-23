/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.ejb.ProjectFacade;
import ch.colabproject.colab.api.ejb.TeamFacade;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.persistence.jpa.project.ProjectDao;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import java.io.InputStream;
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
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
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
    private ProjectFacade projectFacade;

    /** TeamMembers and roles management */
    @Inject
    private TeamFacade teamFacade;

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
        return teamFacade.getTeamMembers(id);
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
        return teamFacade.getProjectRoles(projectId);
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
        return projectFacade.getCardTypes(id);
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
        return projectFacade.getCards(id);
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
        return projectFacade.getCardContents(id);
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
        return projectFacade.getActivityFlowLinks(id);
    }

//    /**
//     * TODO delete
//     *
//     * @param file    the file
//     * @param details some details
//     *
//     * @return some random data
//     */
//    @POST
//    @Consumes(MediaType.MULTIPART_FORM_DATA)
//    public String postFile(
//        @FormDataParam("file") InputStream file,
//        @FormDataParam("file") FormDataContentDisposition details) {
//        return "Salut";
//    }

    /**
     * Dummy method for test purpose only. Should be deleted ASAP
     *
     * @param id      id of the project
     * @param name    name of the file
     * @param content new content of the file
     *
     * @return the saved content
     */
    @GET
    @Path("{id}/TouchFile/{name}/{content}")
    @Produces(MediaType.TEXT_PLAIN)
    public String touchFile(
        @PathParam("id") Long id,
        @PathParam("name") String name,
        @PathParam("content") String content) {
        return projectFacade.touchFile(id, name, content);
    }

//    /**
//     * Get file content
//     *
//     * @param id   id of the project
//     * @param name name of the file
//     *
//     * @return file content
//     */
//    @GET
//    @Path("{id}/GetFile/{name}")
//    @Produces(MediaType.TEXT_PLAIN)
//    public String getFileContent(
//        @PathParam("id") Long id,
//        @PathParam("name") String name) {
//        return projectFacade.getFile(id, name);
//    }
}
