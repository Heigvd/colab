/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.team.acl;

import ch.colabproject.colab.api.model.team.acl.Assignment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 * Assignment persistence
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
 *
 * @author maxence
 * @author sandra
 */
@Stateless
@LocalBean
public class AssignmentDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(AssignmentDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Persist a brand-new assignment to database
     *
     * @param assignment the new assignment to persist
     */
    public void persistAssignment(Assignment assignment) {
        logger.trace("persist assignment {}", assignment);

        em.persist(assignment);
    }

    /**
     * Delete the assignment from database. This can't be undone
     *
     * @param assignment assignment to remove
     */
    public void deleteAssignment(Assignment assignment) {
        logger.trace("delete assignment {}", assignment);

        em.remove(assignment);
    }

}
