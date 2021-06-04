/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.document.ResourceRef;
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
//TODO see if we collapse into an AbstractResourceRef
@Stateless
@LocalBean
public class ResourceRefDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ResourceRefDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * @param id the id of the resource reference to fetch
     *
     * @return the resource reference with the given id or null if such a resource reference does
     *         not exists
     */
    public ResourceRef findResourceRef(Long id) {
        try {
            logger.debug("find resource reference #{}", id);
            return em.find(ResourceRef.class, id);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    /**
     * Update resource reference
     *
     * @param resourceRef the resource reference as supply by clients (ie not managed)
     *
     * @return the updated managed resource reference
     *
     * @throws ColabMergeException if updating the resource reference failed
     */
    public ResourceRef updateResourceRef(ResourceRef resourceRef) throws ColabMergeException {
        logger.debug("update resource reference {}", resourceRef);
        ResourceRef mResourceRef = this.findResourceRef(resourceRef.getId());
        mResourceRef.merge(resourceRef);
        return mResourceRef;
    }

    /**
     * Persist a brand new resource reference to database
     *
     * @param resourceRef the new resource reference to persist
     *
     * @return the new persisted resource reference
     */
    public ResourceRef persistResourceRef(ResourceRef resourceRef) {
        logger.debug("persist resource reference {}", resourceRef);
        em.persist(resourceRef);
        return resourceRef;
    }

    /**
     * Delete an resource reference from database. This can't be undone
     *
     * @param id the id of the resource reference to delete
     *
     * @return just deleted resource reference
     */
    public ResourceRef deleteResourceRef(Long id) {
        logger.debug("delete resource reference #{}", id);
        // TODO: move to recycle bin first
        ResourceRef resourceRef = this.findResourceRef(id);
        em.remove(resourceRef);
        return resourceRef;
    }

}
