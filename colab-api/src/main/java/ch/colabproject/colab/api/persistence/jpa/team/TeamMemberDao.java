/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.team;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import java.util.List;

/**
 * Team member persistence
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class TeamMemberDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(TeamMemberDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find a team member by id
     *
     * @param id the id of the member to fetch
     *
     * @return the team member with the given id or null if such a team member does not exist
     */
    public TeamMember findTeamMember(Long id) {
        logger.trace("find team member #{}", id);

        return em.find(TeamMember.class, id);
    }

    /**
     * Find the teamMember who match the given project and the given user.
     *
     * @param project the project
     * @param user    the user
     *
     * @return the teamMember or null
     */
    public TeamMember findMemberByProjectAndUser(Project project, User user) {
        try {
            TypedQuery<TeamMember> query = em.createNamedQuery("TeamMember.findByProjectAndUser",
                TeamMember.class);

            query.setParameter("projectId", project.getId());
            query.setParameter("userId", user.getId());

            return query.getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    /**
     * Find the teamMembers related to the given user
     *
     * @param user the user
     *
     * @return the matching team members
     */
    public List<TeamMember> findMemberByUser(User user) {
        TypedQuery<TeamMember> query = em.createNamedQuery("TeamMember.findByUser",
            TeamMember.class);

        query.setParameter("userId", user.getId());

        return query.getResultList();
    }

    /**
     * Are two user team-mate?
     *
     * @param a a user
     * @param b another user
     *
     * @return true if both user are both member of the same team
     */
    public boolean findIfUserAreTeammate(User a, User b) {
        TypedQuery<Boolean> query = em.createNamedQuery(
            "TeamMember.areUserTeammate",
            Boolean.class);

        query.setParameter("aUserId", a.getId());
        query.setParameter("bUserId", b.getId());

        // if the query returns something, users are team-mates
        return !query.getResultList().isEmpty();
    }

    /**
     * Update team member. Only fields which are editable by users will be impacted.
     *
     * @param teamMember the team member as supplied by clients (ie not managed by JPA)
     *
     * @return return updated managed team member
     *
     * @throws ColabMergeException if the update failed
     */
    public TeamMember updateTeamMember(TeamMember teamMember) throws ColabMergeException {
        logger.trace("update team member {}", teamMember);

        TeamMember managedTeamMember = this.findTeamMember(teamMember.getId());

        managedTeamMember.mergeToUpdate(teamMember);

        return managedTeamMember;
    }

    /**
     * Persist a brand-new team member to database
     *
     * @param teamMember the new team member to persist
     *
     * @return the new persisted and managed team member
     */
    public TeamMember persistTeamMember(TeamMember teamMember) {
        logger.trace("persist teamMember {}", teamMember);

        em.persist(teamMember);

        return teamMember;
    }

    /**
     * Delete team member from database
     *
     * @param teamMember the team member to delete
     */
    public void deleteTeamMember(TeamMember teamMember) {
        logger.trace("delete team member {}", teamMember);

        em.remove(teamMember);
    }

}
