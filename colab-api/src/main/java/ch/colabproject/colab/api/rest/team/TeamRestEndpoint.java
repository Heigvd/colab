/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.team;

import ch.colabproject.colab.api.controller.team.AssignmentManager;
import ch.colabproject.colab.api.controller.team.TeamManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.team.acl.Assignment;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.team.acl.InvolvementLevel;
import ch.colabproject.colab.api.persistence.jpa.team.TeamMemberDao;
import ch.colabproject.colab.api.persistence.jpa.team.TeamRoleDao;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.List;

/**
 * REST Teams controller. Allow to manage roles and teams members
 *
 * @author maxence
 * @author sandra
 */
@Path("teams")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class TeamRestEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(TeamRestEndpoint.class);

    /** Team specific logic */
    @Inject
    private TeamManager teamManager;

    /** Assignment specific logic */
    @Inject
    private AssignmentManager assignmentManager;

    /** Team member persistence handling */
    @Inject
    private TeamMemberDao teamMemberDao;

    /** Team role persistence handling */
    @Inject
    private TeamRoleDao teamRoleDao;

    // *********************************************************************************************
    // TeamMembers
    // *********************************************************************************************

    /**
     * Get the members of the project team
     *
     * @param projectId id of the project
     *
     * @return list of team members
     */
    @GET
    @Path("members/byproject/{projectId: [0-9]+}")
    public List<TeamMember> getTeamMembersForProject(@PathParam("projectId") Long projectId) {
        logger.debug("Get project #{} members", projectId);
        return teamManager.getTeamMembersForProject(projectId);
    }

    /**
     * Get a TeamMember
     *
     * @param memberId id of the team member
     *
     * @return the team member
     */
    @GET
    @Path("member/{memberId: [0-9]+}")
    public TeamMember getTeamMember(@PathParam("memberId") Long memberId) {
        logger.debug("Get member #{}", memberId);
        return teamMemberDao.findTeamMember(memberId);
    }

    /**
     * Update a TeamMember. Only fields which are editable by users will be impacted.
     *
     * @param member new value
     *
     * @throws ColabMergeException if update failed
     */
    @PUT
    @Path("member")
    public void updateTeamMember(TeamMember member) throws ColabMergeException {
        logger.debug("Update member {}", member);
        teamMemberDao.updateTeamMember(member);
    }

    /**
     * Update hierarchical position of a member
     *
     * @param memberId id of the member
     * @param position new hierarchical position
     */
    @PUT
    @Path("member/{memberId: [0-9]+}/{position}")
    public void changeMemberPosition(
        @PathParam("memberId") Long memberId,
        @PathParam("position") HierarchicalPosition position
    ) {
        teamManager.updatePosition(memberId, position);
    }

    /**
     * Delete a team member
     *
     * @param memberId id of the member
     */
    @DELETE
    @Path("member/{memberId: [0-9]+}")
    public void deleteTeamMember(@PathParam("memberId") Long memberId) {
        logger.debug("Delete team member #{}", memberId);
        teamManager.deleteTeamMember(memberId);
    }

    // *********************************************************************************************
    // Invitations and sharing
    // *********************************************************************************************

    /**
     * Send invitation to someone.
     *
     * @param projectId id of the project
     * @param email     recipient address
     *
     * @return the pending team member
     */
    @POST
    @Path("Invite/{projectId: [0-9]+}/{email}")
    public TeamMember inviteSomeone(@PathParam("projectId") Long projectId,
                                    @PathParam("email") String email) {
        logger.debug("Invite {} to joint project #{}", email, projectId);
        return teamManager.invite(projectId, email);
    }

    // *********************************************************************************************
    // Roles
    // *********************************************************************************************

    /**
     * Get the team roles defined in the given project
     *
     * @param projectId the id of the project
     *
     * @return list of team roles
     */
    @GET
    @Path("roles/byproject/{projectId: [0-9]+}")
    public List<TeamRole> getTeamRolesForProject(@PathParam("projectId") Long projectId) {
        logger.debug("Get project #{} roles", projectId);
        return teamManager.getTeamRolesForProject(projectId);
    }

    /**
     * Create a role. The role must have a projectId set.
     *
     * @param role the role to create
     *
     * @return id of the new role
     */
    @POST
    @Path("role")
    public Long createRole(TeamRole role) {
        logger.debug("Create role {}", role);
        teamManager.createRole(role);
        return role.getId();
    }

    /**
     * Get a role
     *
     * @param roleId id of the role
     *
     * @return the role
     */
    @GET
    @Path("role/{roleId: [0-9]+}")
    public TeamRole getRole(@PathParam("roleId") Long roleId) {
        logger.debug("Get Role #{}", roleId);
        return teamRoleDao.findRole(roleId);
    }

    /**
     * Update a role. Only fields which are editable by users will be impacted.
     *
     * @param role the role to update
     *
     * @throws ColabMergeException if update failed
     */
    @PUT
    @Path("role")
    public void updateRole(TeamRole role) throws ColabMergeException {
        logger.debug("Update role {}", role);
        teamRoleDao.updateRole(role);
    }

    /**
     * Delete a role
     * <p>
     * TODO: shall we allow to delete non-empty roles?
     *
     * @param roleId id of the role to delete id of the role to delete
     */
    @DELETE
    @Path("role/{roleId: [0-9]+}")
    public void deleteRole(@PathParam("roleId") Long roleId) {
        logger.debug("Delete role #{}", roleId);
        teamManager.deleteRole(roleId);
    }

    /**
     * Give a role to a member. Member and role must belong to the same project. CurrentUser must
     * have the right to edit the role
     *
     * @param roleId   id of the role
     * @param memberId id of the team member
     */
    @PUT
    @Path("role/{roleId: [0-9]+}/giveto/{memberId: [0-9]+}")
    public void giveRoleTo(
        @PathParam("roleId") Long roleId,
        @PathParam("memberId") Long memberId
    ) {
        logger.debug("Give role #{} to member#{}", roleId, memberId);
        teamManager.giveRole(roleId, memberId);
    }

    /**
     * Remove a role from some team member. CurrentUser must have the right to edit the role.
     *
     * @param roleId   id of the role
     * @param memberId id of the team member
     */
    @PUT
    @Path("role/{roleId: [0-9]+}/removeto/{memberId : [0-9]+}")
    public void removeRoleFrom(
        @PathParam("roleId") Long roleId,
        @PathParam("memberId") Long memberId
    ) {
        logger.debug("Remove role #{} to member#{}", roleId, memberId);
        teamManager.removeRole(roleId, memberId);
    }

    // *********************************************************************************************
    // Assignments
    // *********************************************************************************************

    /**
     * Get Assignments related to the given project
     *
     * @param projectId the id of the project
     *
     * @return assignments list
     */
    @GET
    @Path("assignments/byproject/{projectId: [0-9]+}")
    public List<Assignment> getAssignmentsForProject(@PathParam("projectId") Long projectId) {
        logger.debug("Get all assignments related to project #{}", projectId);
        return assignmentManager.getAssignmentsForProject(projectId);
    }

    /**
     * Get assignments related to the given card
     *
     * @param cardId id of the card
     *
     * @return assignments list
     */
    @GET
    @Path("assignments/bycard/{cardId: [0-9]+}")
    public List<Assignment> getAssignmentsForCard(@PathParam("cardId") Long cardId) {
        return assignmentManager.getAssignmentsForCard(cardId);
    }

    /**
     * Add an assignment for a card and a member without involvement level
     *
     * @param cardId   id of the card
     * @param memberId id of the team member
     */
    @PUT
    @Path("assignment/card/{cardId: [0-9]+}/member/{memberId: [0-9]+}")
    public void createEmptyAssignment(
        @PathParam("cardId") Long cardId,
        @PathParam("memberId") Long memberId
    ) {
        assignmentManager.setAssignment(cardId, memberId, null);
    }

    /**
     * Set an assignment for a card and a member
     *
     * @param cardId   id of the card
     * @param memberId id of the team member
     * @param level    involvement level
     */
    @POST
    @Path("assignment/card/{cardId: [0-9]+}/member/{memberId: [0-9]+}/{level}")
    public void setAssignment(
        @PathParam("cardId") Long cardId,
        @PathParam("memberId") Long memberId,
        @PathParam("level") InvolvementLevel level
    ) {
        assignmentManager.setAssignment(cardId, memberId, level);
    }

    /**
     * Remove the level of an assignment level for a card and a member
     *
     * @param cardId   id of the card
     * @param memberId id of the team member
     */
    @POST
    @Path("assignment/card/{cardId: [0-9]+}/member/{memberId: [0-9]+}")
    public void removeAssignmentLevel(
        @PathParam("cardId") Long cardId,
        @PathParam("memberId") Long memberId
    ) {
        assignmentManager.setAssignment(cardId, memberId, null);
    }

    /**
     * Delete all assignments for a card and a member
     *
     * @param cardId   id of the card
     * @param memberId id of the team member
     */
    @DELETE
    @Path("assignment/card/{cardId: [0-9]+}/member/{memberId: [0-9]+}")
    public void deleteAssignments(
        @PathParam("cardId") Long cardId,
        @PathParam("memberId") Long memberId
    ) {
        assignmentManager.deleteAssignment(cardId, memberId);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************
}
