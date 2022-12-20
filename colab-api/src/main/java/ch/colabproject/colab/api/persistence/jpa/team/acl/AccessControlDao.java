/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.team.acl;

import ch.colabproject.colab.api.model.team.acl.AccessControl;
import jakarta.ejb.LocalBean;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Access control persistence
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class AccessControlDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(AccessControlDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Delete the access control from database. This can't be undone
     *
     * @param ac access control to remove
     */
    public void deleteAccessControl(AccessControl ac) {
        logger.trace("delete access control {}", ac);

        em.remove(ac);
    }

}
