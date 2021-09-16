/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.document.Resource;
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
public class ResourceDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ResourceDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * @param id the id of the resource to fetch
     *
     * @return the resource with the given id or null if such a resource does not exists
     */
    private Resource findResource(Long id) {
        try {
            logger.debug("find resource #{}", id);
            return em.find(Resource.class, id);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    /**
     * Update resource
     *
     * @param resource the resource as supply by clients (ie not managed)
     *
     * @return the updated managed resource
     *
     * @throws ColabMergeException if updating the resource failed
     */
    public Resource updateResource(Resource resource) throws ColabMergeException {
        logger.debug("update resource {}", resource);
        Resource mResource = this.findResource(resource.getId());
        mResource.merge(resource);
        return mResource;
    }

    /**
     * Persist a brand new resource to database
     *
     * @param resource the new resource to persist
     *
     * @return the new persisted resource
     */
    public Resource persistResource(Resource resource) {
        logger.debug("persist resource {}", resource);
        em.persist(resource);
        return resource;
    }

}
