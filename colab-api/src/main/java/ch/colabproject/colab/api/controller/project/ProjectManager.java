/*
 * The coLAB project
 * Copyright (C) 2021-2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.project;

import ch.colabproject.colab.api.controller.DuplicationManager;
import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.card.CardContentManager;
import ch.colabproject.colab.api.controller.card.CardManager;
import ch.colabproject.colab.api.controller.card.CardTypeManager;
import ch.colabproject.colab.api.controller.document.FileManager;
import ch.colabproject.colab.api.controller.document.ResourceReferenceSpreadingHelper;
import ch.colabproject.colab.api.controller.security.SecurityManager;
import ch.colabproject.colab.api.controller.team.TeamManager;
import ch.colabproject.colab.api.controller.token.TokenManager;
import ch.colabproject.colab.api.model.DuplicationParam;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.common.Illustration;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.project.InstanceMaker;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.project.ProjectType;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.project.InstanceMakerDao;
import ch.colabproject.colab.api.persistence.jpa.project.ProjectDao;
import ch.colabproject.colab.api.rest.project.bean.ProjectStructure;
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
     * Instance maker persistence handler
     */
    @Inject
    private InstanceMakerDao instanceMakerDao;

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

    /** to load cardContents */
    @Inject
    private CardContentManager cardContentManager;

    /**
     * Card type specific logic management
     */
    @Inject
    private CardTypeManager cardTypeManager;

    /**
     * Token specific logic management
     */
    @Inject
    private TokenManager tokenManager;

    /**
     * Resource reference spreading specific logic handling
     */
    @Inject
    private ResourceReferenceSpreadingHelper resourceReferenceSpreadingHelper;

    /**
     * File persistence management
     */
    @Inject
    private FileManager fileManager;

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

        List<Project> projects = projectDao.findProjectsByMember(user.getId());

        projects.addAll(projectDao.findProjectsByInstanceMaker(user.getId()));

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
     * @param name         the name of the new project
     * @param description  the description of the new project
     * @param illustration the illustration of the new project
     * @param modelId      the id of the model the new project is based on
     *
     * @return the new project
     */
    public Project createProjectFromModel(String name, String description,
        Illustration illustration, Long modelId) {
        try {
            return requestManager.sudo(() -> {
                Project project = duplicateProject(modelId,
                    DuplicationParam.buildForCreationFromModel());

                project.setType(ProjectType.PROJECT);
                project.setName(name);
                project.setDescription(description);
                project.setIllustration(illustration);

                return project;
            });
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            return null;
        }
    }

    /**
     * Delete the given project
     *
     * @param projectId the id of the project to delete
     */
    public void deleteProject(Long projectId) {
        Project project = assertAndGetProject(projectId);

//        if (!checkDeletionAcceptability(project)) {
//            throw HttpErrorMessage.dataIntegrityFailure();
//        }

//      tokenManager.deleteTokensByProject(project);
        project.getTeamMembers().stream()
            .forEach(member -> tokenManager.deleteInvitationsByTeamMember(member));

        // everything else is deleted by cascade

        projectDao.deleteProject(project);
    }

//    /**
//     * Ascertain that the project can be deleted
//     *
//     * @param project the project to check for deletion
//     *
//     * @return True iff it can be safely deleted
//     */
//    private boolean checkDeletionAcceptability(Project project) {
//        return true;
//    }

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

        DuplicationManager duplicator = new DuplicationManager(params,
            resourceReferenceSpreadingHelper, fileManager, cardContentManager);

        Project newProjectJavaObject = duplicator.duplicateProject(originalProject);

        Project newProject = createProject(newProjectJavaObject);

        duplicator.duplicateDataIntoJCR();

        duplicator.clear();

        return newProject;
    }

    // *********************************************************************************************
    // sharing
    // *********************************************************************************************

    /**
     * Send a token by email to grant access to use the model.
     *
     * @param modelId the id of the model
     * @param email   the address to send the sharing token to
     *
     * @return the pending potential instance maker
     */
    public InstanceMaker shareModel(Long modelId, String email) {
        logger.debug("Share the model #{} to {}", modelId, email);
        Project model = assertAndGetProject(modelId);

        return tokenManager.sendModelSharingToken(model, email);
    }

    /**
     * Create an instance maker for the model and the user and then persist it in database
     *
     * @param user  the user
     * @param model the model
     *
     * @return the brand new potential instance maker
     */
    public InstanceMaker addAndPersistInstanceMaker(Project model, User user) {
        logger.debug("Add and persist instance maker to user {} for model {}", user, model);

        InstanceMaker instanceMaker = addInstanceMaker(model, user);
        return instanceMakerDao.persistInstanceMaker(instanceMaker);
    }

    /**
     * Create an instance maker for the model and the user
     *
     * @param user  the user
     * @param model the model
     *
     * @return the brand new potential instance maker
     */
    public InstanceMaker addInstanceMaker(Project model, User user) {
        logger.debug("Add instance maker to user {} for model {}", user, model);

        if (model != null && user != null
            && findInstanceMakerByProjectAndUser(model, user) != null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        InstanceMaker instanceMaker = new InstanceMaker();

        instanceMaker.setUser(user);
        instanceMaker.setProject(model);

        return instanceMaker;
    }

    /**
     * Find the instance maker linked to the given project and the given user.
     *
     * @param project the project
     * @param user    the user
     *
     * @return the matching instance makers
     */
    public InstanceMaker findInstanceMakerByProjectAndUser(Project project, User user) {
        return instanceMakerDao.findInstanceMakerByProjectAndUser(project, user);
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
     * Get project whole structure
     *
     * @param projectId id of the project
     *
     * @return project structure
     */
    public ProjectStructure getStructure(Long projectId) {
        logger.debug("get all card contents of project #{}", projectId);

        Project project = assertAndGetProject(projectId);

        ProjectStructure structure = new ProjectStructure();
        Card rootCard = project.getRootCard();

        if (rootCard != null) {
            structure.setRootCardId(rootCard.getId());
        }

        structure.setCards(cardManager.getAllCards(rootCard));

        structure.setCardContents(cardManager.getAllCardContents(rootCard));

        return structure;
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

    /**
     * Get all instance makers linked to the given project.
     *
     * @param projectId the id of the project
     *
     * @return all instance makers linked to the project
     */
    public List<InstanceMaker> getInstanceMakers(Long projectId) {
        logger.debug("Get instance makers of project #{}", projectId);

        Project project = assertAndGetProject(projectId);

        return instanceMakerDao.findInstanceMakersByProject(project);
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
    public List<Long> findIdsOfProjectsCurrentUserIsMemberOf() {
        User user = securityManager.assertAndGetCurrentUser();

        List<Long> projectsIds = projectDao.findProjectsIdsByMember(user.getId());

        logger.debug("found projects' id where the user {} is a team member : {}", user,
            projectsIds);

        return projectsIds;
    }

    /**
     * Retrieve the ids of the projects the current user is an instance maker for.
     * <p>
     * We do not load the java objects. Just work with the ids. Two reasons : 1. the ids are enough,
     * so it is lighter + 2. prevent from loading object the user is not allowed to read
     *
     * @return the ids of the matching projects
     */
    public List<Long> findIdsOfProjectsCurrentUserIsInstanceMakerFor() {
        User user = securityManager.assertAndGetCurrentUser();

        List<Long> projectsIds = projectDao.findProjectsIdsByInstanceMaker(user.getId());

        logger.debug("found projects' id for which the user {} is an instance maker : {}", user,
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

    /**
     * Do the two users have common project ?
     *
     * @param a one user
     * @param b another user
     *
     * @return true if both users are related to the same project
     */
    public boolean doUsersHaveCommonProject(User a, User b) {
        return projectDao.findIfUsersHaveCommonProject(a, b);
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
