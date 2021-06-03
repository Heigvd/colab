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
import ch.colabproject.colab.api.model.team.TeamMember;
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
     * Project persistence
     */
    @Inject
    private ProjectDao projectDao;

    /**
     * Cards-related logic
     */
    @Inject
    private CardFacade cardFacade;

    /**
     * Token Facade
     */
    @Inject
    private TokenFacade tokenFacade;

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
        logger.debug("Create new project: {}", project);
        Card rootCard = cardFacade.initNewRootCard();
        project.setRootCard(rootCard);
        rootCard.setRootCardProject(project);

        User user = securityFacade.assertAndGetCurrentUser();
        this.addMember(project, user);

        return projectDao.createProject(project);
    }

    // *********************************************************************************************
    // team members
    // *********************************************************************************************

    /**
     * Add given user to the project teams
     *
     * @param project the project
     * @param user the user
     *
     * @return the brand new member
     */
    public TeamMember addMember(Project project, User user) {
        logger.debug("Add member {} in {}", user, project);
        TeamMember teamMember = new TeamMember();

        // todo check if user is already member of the team
        teamMember.setUser(user);
        teamMember.setProject(project);
        project.getTeamMembers().add(teamMember);
        if (user != null) {
            user.getTeamMembers().add(teamMember);
        }
        return teamMember;
    }

    /**
     * Get all members of the given project
     *
     * @param id id of the project
     *
     * @return all members of the project team
     */
    public List<TeamMember> getTeamMembers(Long id) {
        Project project = projectDao.getProject(id);
        logger.debug("Get team members: {}", project);
        securityFacade.assertIsMember(project);
        return project.getTeamMembers();
    }

    /**
     * Send invitation
     *
     * @param projectId if of the project
     * @param email send invitation to this address
     */
    public void invite(Long projectId, String email) {
        Project project = projectDao.getProject(projectId);
        logger.debug("Invite {} to join {}", email, project);
        securityFacade.assertProjectWriteRight(project);
        tokenFacade.sendMembershipInvitation(project, email);
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
