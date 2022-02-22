/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.team;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.team.acl.AccessControl;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

/**
 * Team persistence (TeamRole &amp; TeamMember)
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class TeamDao {

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find a TeamRole by id
     *
     * @param roleId id of the role
     *
     * @return the role or null if it does no exist
     */
    public TeamRole findRole(Long roleId) {
        return em.find(TeamRole.class, roleId);
    }

    /**
     * Find a teamMember by id
     *
     * @param memberId id of the member
     *
     * @return the member or null if it does no exist
     */
    public TeamMember findTeamMember(Long memberId) {
        return em.find(TeamMember.class, memberId);
    }

    /**
     * Update a team member
     *
     * @param member new value
     *
     * @return updated managed member
     * @throws ColabMergeException if update failed
     */
    public TeamMember updateTeamMember(TeamMember member) throws ColabMergeException {
        TeamMember managedMember = this.findTeamMember(member.getId());
        if (managedMember == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        managedMember.merge(member);

        return managedMember;
    }

    /**
     * Remove role from database
     *
     * @param role the role to delete
     */
    public void removeRole(TeamRole role) {
        em.remove(role);
    }

    /**
     * Remove access control
     *
     * @param ac access control to remove
     */
    public void removeAccessControl(AccessControl ac) {
        if (ac.getMember() != null) {
            ac.getMember().getAccessControlList().remove(ac);
        }

        if (ac.getRole() != null) {
            ac.getRole().getAccessControl().remove(ac);
        }

        if (ac.getCard() != null) {
            ac.getCard().getAccessControlList().remove(ac);
        }

        em.remove(ac);
    }

    /**
     * Find the teamMember who match the given project and the given user.
     *
     * @param project the project
     * @param user    the user
     *
     * @return the teamMember or null
     */
    public TeamMember findMemberByUserAndProject(Project project, User user) {
        try {
            TypedQuery<TeamMember> query = em.createNamedQuery("TeamMember.findByUserAndProject", TeamMember.class);

            query.setParameter("projectId", project.getId());
            query.setParameter("userId", user.getId());

            return query.getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    /**
     * Are two user teammate?
     *
     * @param a a user
     * @param b another user
     *
     * @return true if both user are both member of the same team
     */
    public boolean areUserTeammate(User a, User b) {
        TypedQuery<Boolean> query = em.createNamedQuery(
            "TeamMember.areUserTeammate",
            Boolean.class);

        query.setParameter(
            "aUserId", a.getId());
        query.setParameter(
            "bUserId", b.getId());

        // if the query returns something, users are teammates
        return !query.getResultList()
            .isEmpty();
    }
}
