/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
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
import ch.colabproject.colab.api.model.project.CopyParam;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.persistence.jpa.project.CopyParamDao;
import ch.colabproject.colab.api.persistence.jpa.project.ProjectDao;
import ch.colabproject.colab.api.rest.project.bean.ProjectCreationData;
import ch.colabproject.colab.api.rest.project.bean.ProjectStructure;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.List;
import java.util.Set;

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

    /** Project business logic */
    @Inject
    private ProjectManager projectManager;

    /** TeamMembers and roles management */
    @Inject
    private TeamManager teamManager;

    /** Project persistence */
    @Inject
    private ProjectDao projectDao;

    /** Copy parameters persistence */
    @Inject
    private CopyParamDao copyParamDao;

    // *********************************************************************************************
    // get
    // *********************************************************************************************

    /**
     * Get project identified by the given id.
     *
     * @param id id of the project to fetch
     *
     * @return the project or null
     */
    @GET
    @Path("/{id: [0-9]+}")
    public Project getProject(@PathParam("id") Long id) {
        logger.debug("Get project #{}", id);
        return projectDao.findProject(id);
    }

    /**
     * Get all projects the current user is a team member of
     *
     * @return list of projects
     */
    @GET
    @Path("Mine")
    public List<Project> getProjectsWhereTeamMember() {
        logger.debug("Get projects where current user is a team member of");
        return projectManager.findProjectsWhereTeamMember();
    }

    /**
     * Get all global models
     * @return  list of global models
     */
    @GET
    @Path("Global")
    public List<Project> getAllGlobalModels() {
        logger.debug("Get all global projects");
        return projectDao.findAllGlobalModels();
    }

    /**
     * Get all projects the current user is an instance maker for
     *
     * @return list of matching projects
     */
    @GET
    @Path("MyInstanceableModels")
    public List<Project> getInstanceableModels() {
        logger.debug("Get all models linked by a instancemaker to the current user");
        return projectManager.findInstanceableModelsForCurrentUser();
    }

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


    // *********************************************************************************************
    // create
    // *********************************************************************************************

    /**
     * Create a new project from scratch with the provided data and register current user as a
     * member.
     *
     * @param creationData the data needed to fill the project
     *
     * @return id of the persisted new project
     */
    @POST
    @Path("createProject")
    public Long createProject(ProjectCreationData creationData) {
        logger.debug("Create a project with {}", creationData);

        Project project = projectManager.createProject(creationData);

        creationData.getGuestsEmail().stream().forEach(email -> {
            teamManager.invite(project.getId(), email);
        });

        return project.getId();
    }

    /**
     * Duplicate the given project
     *
     * @param baseProjectId the id of the project we want to duplicate
     * @param name          the name of the new project
     * @param params        the parameters to fine tune the duplication
     *
     * @return the id of the duplicated project
     *
     * @throws ColabMergeException if the name cannot be updated
     */
    @POST
    @Path("copyProject/{id: [0-9]+}/{name}")
    public Long duplicateProject(@PathParam("id") Long baseProjectId,
        @PathParam("name") String name, DuplicationParam params) throws ColabMergeException {
        logger.debug("duplicate the project #{} with params {}", baseProjectId, params);

        DuplicationParam effectiveParams = params;
        if (effectiveParams == null) {
            effectiveParams = DuplicationParam.buildDefaultForProjectDuplication();
        }

        // check forced parameters
        if (effectiveParams.isMakeOnlyCardTypeReferences()) {
            throw new IllegalArgumentException();
        }

        Project newProject = projectManager.duplicateProject(baseProjectId, effectiveParams);

        newProject.setName(name);

        projectDao.updateProject(newProject);

        return newProject.getId();
    }

    // *********************************************************************************************
    // update
    // *********************************************************************************************

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
     * Save changes to database.
     *
     * @param copyParam the copy parameters to update
     *
     * @throws ColabMergeException if the merge is not possible
     */
    @PUT
    @Path("copyParam")
    public void updateCopyParam(CopyParam copyParam) throws ColabMergeException {
        logger.debug("Update copy param {}", copyParam);
        copyParamDao.updateCopyParam(copyParam);
    }

    // *********************************************************************************************
    // delete
    // *********************************************************************************************

    /**
     * Put the given project in the bin. (= set DeletionStatus to BIN + set erasure
     * tracking data)
     *
     * @param projectId the id of the project
     *
     * @throws HttpErrorMessage if project does not exist
     */
    @PUT
    @Path("{projectId: [0-9]+}/PutInBin")
    public void putProjectInBin(@PathParam("projectId") Long projectId) {
        logger.debug("put in bin project #{}", projectId);
        projectManager.putProjectInBin(projectId);
    }

    /**
     * Restore from the bin. The project won't contain any deletion or erasure data
     * anymore.
     * <p>
     * It means that the project is back at its place.
     *
     * @param projectId the id of the project
     *
     * @throws HttpErrorMessage if project does not exist
     */
    @PUT
    @Path("{projectId: [0-9]+}/RestoreFromBin")
    public void restoreProjectFromBin(@PathParam("projectId") Long projectId) {
        logger.debug("restore from bin project #{}", projectId);
        projectManager.restoreProjectFromBin(projectId);
    }

    /**
     * Set the deletion status to TO_DELETE.
     * <p>
     * It means that the project is only visible in the bin panel.
     *
     * @param projectId the id of the project
     *
     * @throws HttpErrorMessage if project does not exist
     */
    @PUT
    @Path("{projectId: [0-9]+}/FlagAsToDeleteForever")
    public void flagProjectAsToDeleteForever(@PathParam("projectId") Long projectId) {
        logger.debug("flag project #{} as to delete forever", projectId);
        projectManager.flagProjectAsToDeleteForever(projectId);
    }

    // *********************************************************************************************
    // get project content
    // *********************************************************************************************

    /**
     * Get the root card of the project
     *
     * @param projectId the id of the project
     *
     * @return the matching card
     */
    @GET
    @Path("{id: [0-9]+}/RootCard")
    public Card getRootCardOfProject(@PathParam("id") Long projectId) {
        logger.debug("get the root card of the project #{}", projectId);
        return projectManager.getRootCard(projectId);
    }

    /**
     * Get all card types belonging to a project
     *
     * @param projectId the id of the project
     *
     * @return list of card types
     */
    @GET
    @Path("{id: [0-9]+}/CardTypes")
    public Set<AbstractCardType> getCardTypesOfProject(@PathParam("id") Long projectId) {
        logger.debug("Get project #{} card types", projectId);
        return projectManager.getCardTypes(projectId);
    }

    /**
     * Get all cards belonging to a project
     *
     * @param projectId the id of the project
     *
     * @return list of cards
     */
    @GET
    @Path("{id: [0-9]+}/Cards")
    public Set<Card> getCardsOfProject(@PathParam("id") Long projectId) {
        logger.debug("Get project #{} cards", projectId);
        return projectManager.getCards(projectId);
    }

    /**
     * Get all cardContents belonging to a project
     *
     * @param projectId the id of the project
     *
     * @return list of cardContents
     */
    @GET
    @Path("{id: [0-9]+}/CardContents")
    public Set<CardContent> getCardContentsOfProject(@PathParam("id") Long projectId) {
        logger.debug("Get project #{} cardContents", projectId);
        return projectManager.getCardContents(projectId);
    }

    /**
     * Get all cards, cardContents and structure of a project in one shot.
     *
     * @param projectId the id of the project
     *
     * @return full structure of the project
     */
    @GET
    @Path("{id: [0-9]+}/structure")
    public ProjectStructure getStructureOfProject(@PathParam("id") Long projectId) {
        logger.debug("Get project #{} cardContents", projectId);
        return projectManager.getStructure(projectId);
    }

    /**
     * Get all activity flow links belonging to a project
     *
     * @param projectId the id of the project
     *
     * @return list of activity flow links
     */
    @GET
    @Path("{id: [0-9]+}/ActivityFlowLink")
    public Set<ActivityFlowLink> getActivityFlowLinks(@PathParam("id") Long projectId) {
        logger.debug("Get project #{} activityflowlinks", projectId);
        return projectManager.getActivityFlowLinks(projectId);
    }

    /**
     * Get the copy parameters of the project
     *
     * @param projectId the id of the project
     *
     * @return the related copy parameters
     */
    @GET
    @Path("{id: [0-9]+}/copyParams")
    public CopyParam getCopyParam(@PathParam("id") Long projectId) {
        CopyParam copyParam = projectManager.getCopyParam(projectId);
        logger.debug("Got project #{} copy param : {}", projectId, copyParam);
        return copyParam;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
