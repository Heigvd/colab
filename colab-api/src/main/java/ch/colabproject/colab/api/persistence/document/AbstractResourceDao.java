/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.document;

import ch.colabproject.colab.api.model.document.AbstractResource;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Resource and resource reference persistence
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class AbstractResourceDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(AbstractResourceDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * @param id the id of the resource / resource reference to fetch
     *
     * @return the resource / resource reference with the given id or null if such a resource /
     *         resource reference does not exists
     */
    public AbstractResource findResourceOrRef(Long id) {
        try {
            logger.debug("find abstract resource #{}", id);
            return em.find(AbstractResource.class, id);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    /**
     * Delete a resource / resource reference from database. This can't be undone
     *
     * @param id the id of the resource / resource reference to delete
     *
     * @return just deleted resource / resource reference
     */
    public AbstractResource deleteResourceOrRef(Long id) {
        logger.debug("delete abstract resource reference #{}", id);
        // TODO: move to recycle bin first
        AbstractResource resourceRef = this.findResourceOrRef(id);
        em.remove(resourceRef);
        return resourceRef;
    }

}
