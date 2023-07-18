/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import java.util.List;
import java.util.stream.Collectors;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Resource and resource reference persistence
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
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

//    /**
//     * Find a resource by id
//     *
//     * @param id the id of the resource to fetch
//     *
//     * @return the resource with the given id or null if such a resource does not exist
//     */
//    private Resource findResource(Long id) {
//        logger.trace("find resource #{}", id);
//
//        return em.find(Resource.class, id);
//    }

//    /**
//     * Find a resource reference by id
//     *
//     * @param id the id of the resource reference to fetch
//     *
//     * @return the resource reference with the given id or null if such a resource reference does
//     *         not exist
//     */
//    private ResourceRef findResourceRef(Long id) {
//        logger.trace("find resource reference #{}", id);
//
//        return em.find(ResourceRef.class, id);
//    }

    /**
     * @param id the id of the resource / resource reference to fetch
     *
     * @return the resource / resource reference with the given id or null if such a resource /
     *         resource reference does not exist
     */
    public AbstractResource findResourceOrRef(Long id) {
        logger.trace("find abstract resource #{}", id);

        return em.find(AbstractResource.class, id);
    }

    /**
     * Retrieve the resources references that have the given target
     *
     * @param target the target
     *
     * @return the matching references
     */
    public List<ResourceRef> findDirectReferences(AbstractResource target) {
        logger.trace("find the direct references of the target {}", target);

        TypedQuery<ResourceRef> query = em.createNamedQuery("ResourceRef.findDirectReferences",
            ResourceRef.class);

        query.setParameter("targetId", target.getId());

        return query.getResultList();
    }

    /**
     * Retrieve all resources which transitively references the given target
     *
     * @param target the target
     *
     * @return the matching references
     */
    public List<ResourceRef> findAllReferences(AbstractResource target) {
        logger.trace("find all references to the target {}", target);

        // first, fetch direct references
        List<ResourceRef> list = findDirectReferences(target);

        // and recurse
        list.addAll(list.stream().flatMap(res -> {
            return findAllReferences(res).stream();
        }).collect(Collectors.toList()));

        return list;
    }

    /**
     * Update resource. Only fields which are editable by users will be impacted.
     *
     * @param <T>           a sub type of AbstractResource
     * @param resourceOrRef the resource as supplied by clients (ie not managed by JPA)
     *
     * @return return updated managed resource
     *
     * @throws ColabMergeException if the update failed
     */
    public <T extends AbstractResource> T updateResourceOrRef(T resourceOrRef)
        throws ColabMergeException {
        logger.trace("update resource or ref {}", resourceOrRef);

        @SuppressWarnings("unchecked")
        T managedResource = (T) this.findResourceOrRef(resourceOrRef.getId());

        managedResource.mergeToUpdate(resourceOrRef);

        return managedResource;
    }

    /**
     * Persist a brand new resource to database
     *
     * @param resource the new resource to persist
     *
     * @return the new persisted and managed resource
     */
    public Resource persistResource(Resource resource) {
        logger.trace("persist resource {}", resource);

        em.persist(resource);

        return resource;
    }

    // Note : there is no persistResourceRef because they are automatically generated
    // and are persisted by cascade

    /**
     * Delete the resource / resource reference from database. This can't be undone
     *
     * @param resourceOrRef the resource / resource reference to delete
     */
    public void deleteResourceOrRef(AbstractResource resourceOrRef) {
        logger.trace("delete abstract resource {}", resourceOrRef);

        // TODO: move to recycle bin first

        em.remove(resourceOrRef);
    }

}
