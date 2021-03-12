/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.ejb.ProjectFacade;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.project.Project;
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

    /**
     * The Project business logic
     */
    @Inject
    private ProjectFacade projectFacade;

    /**
     * Retrieve the list of all projects. This is available to admin only
     *
     * @return all known project
     */
    @GET
    @AdminResource
    public List<Project> getAllProjects() {
        return projectFacade.getAllProject();
    }

    /**
     * Get project identified by the given id
     *
     * @param id id of the project to fetch
     *
     * @return the project or null
     */
    @GET
    @Path("/{id}")
    public Project getProject(@PathParam("id") Long id) {
        return projectFacade.getProject(id);
    }

    /**
     * Persist the project
     *
     * @param project the project to persist
     *
     * @return id of the persisted new project
     */
    @POST
    public Long createProject(Project project) {
        return projectFacade.createProject(project).getId();
    }

    /**
     * Save changes to database
     *
     * @param project project to update
     *
     * @throws ColabMergeException if the merge is not possible
     */
    @PUT
    public void updateProject(Project project) throws ColabMergeException {
        projectFacade.updateProject(project);
    }

    /**
     * Permanently delete a project
     *
     * @param id id of the project to delete
     */
    @DELETE
    @Path("/{id}")
    public void deleteProject(@PathParam("id") Long id) {
        projectFacade.deleteProject(id);
    }
}
