/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.team;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.team.TeamRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 * Team role persistence
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class TeamRoleDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(TeamRoleDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find a role by id
     *
     * @param id the id of the role to fetch
     *
     * @return the role with the given id or null if such a role does not exist
     */
    public TeamRole findRole(Long id) {
        logger.trace("find role #{}", id);

        return em.find(TeamRole.class, id);
    }

    /**
     * Update the role. Only fields which are editable by users will be impacted.
     *
     * @param teamRole the role as supplied by clients (ie not managed by JPA)
     *
     * @return return updated managed role
     *
     * @throws ColabMergeException if the update failed
     */
    public TeamRole updateRole(TeamRole teamRole) throws ColabMergeException {
        logger.trace("update team role {}", teamRole);

        TeamRole managedTeamRole = this.findRole(teamRole.getId());

        managedTeamRole.mergeToUpdate(teamRole);

        return managedTeamRole;
    }

    /**
     * Delete the role from database. This can't be undone
     *
     * @param role the role to delete
     */
    public void deleteRole(TeamRole role) {
        logger.trace("delete role {}", role);

        em.remove(role);
    }

}
