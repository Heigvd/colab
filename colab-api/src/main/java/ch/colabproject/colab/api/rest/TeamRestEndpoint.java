/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.ejb.TeamFacade;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.team.Role;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.persistence.project.TeamDao;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
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

    /** * Team facade */
    @Inject
    private TeamFacade teamFacade;

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
        return teamFacade.invite(projectId, email);
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
    public Long createRole(Role role) {
        logger.debug("Create role {}", role);
        teamFacade.createRole(role);
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
    public Role getRole(@PathParam("roleId") Long roleId) {
        logger.debug("Get Role #{}", roleId);
        return teamDao.findRole(roleId);
    }

    /**
     * Update a role.This will only affect the role name.
     *
     * @param role the role to update
     *
     * @throws ch.colabproject.colab.api.exceptions.ColabMergeException if update failed
     *
     */
    @PUT
    @Path("role")
    public void updateRole(Role role) throws ColabMergeException {
        logger.debug("Update role {}", role);
        teamFacade.updateRole(role);
    }

    /**
     * Delete a role
     * <p>
     * TODO: shall we allow to delete non-empty roles?
     *
     * @param roleId id of the role to delete id of the role to delete
     *
     */
    @DELETE
    @Path("role/{roleId: [0-9]+}")
    public void deleteRole(@PathParam("roleId") Long roleId) {
        logger.debug("Delete role #{}", roleId);
        teamFacade.deleteRole(roleId);
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
        teamFacade.giveRole(roleId, memberId);
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
        teamFacade.removeRole(roleId, memberId);
    }
}
