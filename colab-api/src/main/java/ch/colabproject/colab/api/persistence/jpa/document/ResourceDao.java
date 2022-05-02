/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
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
     * Retrieve the card type references that have the given target
     *
     * @param target the target
     *
     * @return the matching references
     */
    public List<ResourceRef> findDirectReferences(AbstractResource target) {
        logger.debug("find the direct references of the target {}", target);

        TypedQuery<ResourceRef> query = em.createNamedQuery("ResourceRef.findDirectReferences",
            ResourceRef.class);

        query.setParameter("targetId", target.getId());

        return query.getResultList();
    }

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
     * @param id the id of the resource reference to fetch
     *
     * @return the resource reference with the given id or null if such a resource reference does
     *         not exists
     */
    private ResourceRef findResourceRef(Long id) {
        try {
            logger.debug("find resource reference #{}", id);
            return em.find(ResourceRef.class, id);
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
