/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.Role;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.project.ProjectDao;
import ch.colabproject.colab.api.persistence.project.TeamDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import java.util.Objects;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Some logic to manage project teams
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class TeamFacade {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(TeamFacade.class);

    /** * Project persistence */
    @Inject
    private ProjectDao projectDao;

    /** Team persistence */
    @Inject
    private TeamDao teamDao;

    /** * Token Facade */
    @Inject
    private TokenFacade tokenFacade;

    // *********************************************************************************************
    // team members
    // *********************************************************************************************
    /**
     * Add given user to the project teams
     *
     * @param project the project
     * @param user    the user
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

        if (project == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return project.getTeamMembers();
    }

    /**
     * Send invitation
     *
     * @param projectId if of the project
     * @param email     send invitation to this address
     *
     * @return the pending new teamMember
     */
    public TeamMember invite(Long projectId, String email) {
        Project project = projectDao.getProject(projectId);
        logger.debug("Invite {} to join {}", email, project);
        return tokenFacade.sendMembershipInvitation(project, email);
    }

    // *********************************************************************************************
    // Roles
    // *********************************************************************************************
    /**
     * Get all the roles defined in the given project
     *
     * @param id the project
     *
     * @return list of roles
     */
    public List<Role> getProjectRoles(Long id) {
        Project project = projectDao.getProject(id);
        if (project != null) {
            return project.getRoles();
        } else {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
    }

    /**
     * Create a role. The role must have a projectId set.
     *
     * @param role role to create
     *
     * @return the brand new persisted role
     */
    public Role createRole(Role role) {
        if (role.getProjectId() != null) {
            Project project = projectDao.getProject(role.getProjectId());
            if (project != null
                && project.getRoleByName(role.getName()) == null) {
                project.getRoles().add(role);
                role.setProject(project);
                return role;
            }
        }
        throw HttpErrorMessage.relatedObjectNotFoundError();
    }

    /**
     * Update role
     *
     * @param role role to update
     *
     * @return the managed and updated role
     *
     * @throws ch.colabproject.colab.api.exceptions.ColabMergeException if merge failed
     */
    public Role updateRole(Role role) throws ColabMergeException {
        if (role != null) {
            Role managedRole = teamDao.findRole(role.getId());
            if (managedRole != null) {
                managedRole.merge(role);
                return managedRole;
            }
        }
        throw HttpErrorMessage.relatedObjectNotFoundError();
    }

    /**
     * Delete role
     *
     * @param roleId id of the role to delete
     */
    public void deleteRole(Long roleId) {
        Role role = teamDao.findRole(roleId);
        if (role != null) {
            Project project = role.getProject();
            if (project != null) {
                project.getRoles().remove(role);
            }
            role.getMembers().forEach(member -> {
                List<Role> roles = member.getRoles();
                if (roles != null) {
                    roles.remove(role);
                }
            });
            teamDao.removeRole(role);
        }
    }

    /**
     * Give a role to someone. The role and the member must belong to the very same project.
     *
     * @param roleId   id of the role
     * @param memberId id of the teamMember
     */
    public void giveRole(Long roleId, Long memberId) {
        Role role = teamDao.findRole(roleId);
        TeamMember member = teamDao.findTeamMember(memberId);
        if (role != null && member != null) {
            if (Objects.equals(role.getProject(), member.getProject())) {
                List<TeamMember> members = role.getMembers();
                List<Role> roles = member.getRoles();
                if (!members.contains(member)) {
                    members.add(member);
                }
                if (!roles.contains(role)) {
                    roles.add(role);
                }
            } else {
                throw HttpErrorMessage.badRequest();
            }
        }
    }

    /**
     * Remove a role from someone.
     *
     * @param roleId   id of the role
     * @param memberId id of the member
     */
    public void removeRole(Long roleId, Long memberId) {
        Role role = teamDao.findRole(roleId);
        TeamMember member = teamDao.findTeamMember(memberId);
        if (role != null && member != null) {
            List<TeamMember> members = role.getMembers();
            List<Role> roles = member.getRoles();
            members.remove(member);
            roles.remove(role);
        }
    }

}
