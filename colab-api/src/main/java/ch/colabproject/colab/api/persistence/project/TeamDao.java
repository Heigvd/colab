/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.project;

import ch.colabproject.colab.api.model.team.Role;
import ch.colabproject.colab.api.model.team.TeamMember;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 * Team persistence (Role &amp; TeamMember)
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
     * Find a Role by id
     *
     * @param roleId id of the role
     *
     * @return the role or null if it does no exist
     */
    public Role findRole(Long roleId) {
        return em.find(Role.class, roleId);
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
}
