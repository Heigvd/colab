/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.team;

import ch.colabproject.colab.api.controller.team.TeamManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.team.acl.AccessControl;
import ch.colabproject.colab.api.model.team.acl.InvolvementLevel;
import ch.colabproject.colab.api.persistence.jpa.team.TeamDao;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
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
 * REST Teams controller. Allow to manage roles and teams members
 *
 * @author maxence
 */
@Path("teams")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class TeamRestEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(TeamRestEndpoint.class);

    /** * Team manager */
    @Inject
    private TeamManager teamManager;

    /** Team persistence */
    @Inject
    private TeamDao teamDao;

    // *********************************************************************************************
    // TeamMembers
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
        return teamDao.findTeamMember(memberId);
    }

    /**
     * Update a TeamMember
     *
     * @param member new value
     *
     * @return the team member
     * @throws ColabMergeException if update failed
     */
    @PUT
    @Path("member")
    public TeamMember updateTeamMember(TeamMember member) throws ColabMergeException {
        logger.debug("Update member {}", member);
        return teamDao.updateTeamMember(member);
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

    // *********************************************************************************************
    // Roles
    // *********************************************************************************************
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
        return teamDao.findRole(roleId);
    }

    /**
     * Update a role.This will only affect the role name.
     *
     * @param role the role to update
     *
     * @throws ch.colabproject.colab.api.exceptions.ColabMergeException if update failed
     */
    @PUT
    @Path("role")
    public void updateRole(TeamRole role) throws ColabMergeException {
        logger.debug("Update role {}", role);
        teamManager.updateRole(role);
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
    @Path("role/{roleId: [0-9]+}/giveto/{memberId : [0-9]+}")
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

    /**
     * Get ACL for the card
     *
     * @param cardId id of the card
     *
     * @return access control list
     */
    @GET
    @Path("acl/{cardId: [0-9]+}")
    public List<AccessControl> getAcl(@PathParam("cardId") Long cardId) {
        return teamManager.getAccessControlList(cardId);
    }

    /**
     * Update access control for a member
     *
     * @param cardId   id of the card
     * @param memberId id of the team member
     * @param level    involvement level
     */
    @PUT
    @Path("acl/{cardId: [0-9]+}/member/{memberId : [0-9]+}/{level}")
    public void setMemberInvolvement(
        @PathParam("cardId") Long cardId,
        @PathParam("memberId") Long memberId,
        @PathParam("level") InvolvementLevel level
    ) {
        teamManager.setInvolvementLevelForMember(cardId, memberId, level);
    }

    /**
     * Clear access control for a member
     *
     * @param cardId   id of the card
     * @param memberId id of the team member
     */
    @DELETE
    @Path("acl/{cardId: [0-9]+}/member/{memberId : [0-9]+}")
    public void clearMemberInvolvement(
        @PathParam("cardId") Long cardId,
        @PathParam("memberId") Long memberId
    ) {
        teamManager.setInvolvementLevelForMember(cardId, memberId, null);
    }

    /**
     * Update access control for a role
     *
     * @param cardId id of the card
     * @param roleId id of the role
     * @param level  involvement level
     */
    @PUT
    @Path("acl/{cardId: [0-9]+}/role/{roleId : [0-9]+}/{level}")
    public void setRoleInvolvement(
        @PathParam("cardId") Long cardId,
        @PathParam("roleId") Long roleId,
        @PathParam("level") InvolvementLevel level
    ) {
        teamManager.setInvolvementLevelForRole(cardId, roleId, level);
    }

    /**
     * Clear access control for a role
     *
     * @param cardId id of the card
     * @param roleId id of the role
     */
    @DELETE
    @Path("acl/{cardId: [0-9]+}/role/{roleId : [0-9]+}")
    public void clearRoleInvolvement(
        @PathParam("cardId") Long cardId,
        @PathParam("roleId") Long roleId
    ) {
        teamManager.setInvolvementLevelForRole(cardId, roleId, null);
    }
}
