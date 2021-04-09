/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.project.ProjectDao;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;

/**
 * Some project logic
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class ProjectFacade {

    /**
     * To control access
     */
    @Inject
    private SecurityFacade securityFacade;

    /**
     * Project DAO
     */
    @Inject
    private ProjectDao projectDao;

    /**
     * Token Facade
     */
    @Inject
    private TokenFacade tokenFacade;

    /**
     * Persist the given project and add the current user to the project team
     *
     * @param project project to persist
     *
     * @return the new persisted project
     */
    public Project createNewProject(Project project) {
        User user = securityFacade.assertAndGetCurrentUser();
        this.addMember(project, user);
        return projectDao.createProject(project);
    }

    /**
     * Add given user to the project teams
     *
     * @param project the project
     * @param user    the user
     *
     * @return the brand new member
     */
    public TeamMember addMember(Project project, User user) {
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
        securityFacade.assertIsMember(project);
        return project.getTeamMembers();
    }

    /**
     * Send invitation
     *
     * @param projectId if of the project
     * @param email     send invitation to this address
     */
    public void invite(Long projectId, String email) {
        Project project = projectDao.getProject(projectId);
        tokenFacade.sendMembershipInvitation(project, email);
    }
}
