/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.project;

import ch.colabproject.colab.api.model.project.InstanceMaker;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.User;
import java.util.List;
import jakarta.ejb.LocalBean;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Instance maker persistence
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class InstanceMakerDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(InstanceMakerDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

//    /**
//     * Find an instance maker by id
//     *
//     * @param id the id of the instance maker
//     *
//     * @return the instance maker or null if it does not exist
//     */
//    public InstanceMaker findInstanceMaker(Long id) {
//        logger.trace("find instance maker #{}", id);
//
//        return em.find(InstanceMaker.class, id);
//    }

    /**
     * Find the instance maker who match the given project and the given user.
     *
     * @param project the project
     * @param user    the user
     *
     * @return the instance maker or null
     */
    public InstanceMaker findInstanceMakerByProjectAndUser(Project project, User user) {
        try {
            TypedQuery<InstanceMaker> query = em.createNamedQuery(
                "InstanceMaker.findByProjectAndUser",
                InstanceMaker.class);

            query.setParameter("projectId", project.getId());
            query.setParameter("userId", user.getId());

            return query.getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

//    /**
//     * Find the instance makers related to the given user
//     *
//     * @param user the user
//     *
//     * @return the matching instance makers
//     */
//    public List<InstanceMaker> findInstanceMakersByUser(User user) {
//        TypedQuery<InstanceMaker> query = em.createNamedQuery("InstanceMaker.findByUser",
//            InstanceMaker.class);
//
//        query.setParameter("userId", user.getId());
//
//        return query.getResultList();
//    }

    /**
     * Find the instance makers related to the given project
     *
     * @param project the project
     *
     * @return the matching instance makers
     */
    public List<InstanceMaker> findInstanceMakersByProject(Project project) {
        TypedQuery<InstanceMaker> query = em.createNamedQuery("InstanceMaker.findByProject",
            InstanceMaker.class);

        query.setParameter("projectId", project.getId());

        return query.getResultList();
    }

//    /**
//     * Update instance maker. Only fields which are editable by users will be impacted.
//     *
//     * @param instanceMaker the instance maker as supplied by clients (ie not managed by JPA)
//     *
//     * @return return updated managed instance maker
//     *
//     * @throws ColabMergeException if the update failed
//     */
//    public InstanceMaker updateInstanceMaker(InstanceMaker instanceMaker) throws ColabMergeException {
//        logger.trace("update instance maker {}", instanceMaker);
//
//        InstanceMaker managedInstanceMaker = this.findInstanceMaker(instanceMaker.getId());
//
//        managedInstanceMaker.merge(instanceMaker);
//
//        return managedInstanceMaker;
//    }

    /**
     * Persist a brand new instance maker to database
     *
     * @param instancemaker the new instance maker to persist
     *
     * @return the new persisted and managed instance maker
     */
    public InstanceMaker persistInstanceMaker(InstanceMaker instancemaker) {
        logger.trace("persist instance maker {}", instancemaker);

        em.persist(instancemaker);

        return instancemaker;
    }

//    /**
//     * Delete the instance maker from database. This can't be undone
//     *
//     * @param instanceMaker the instance maker to delete
//     *
//     * @return the just deleted instance maker
//     */
//    public InstanceMaker deleteInstanceMaker(Long id) {
//        logger.trace("delete instance maker #{}", id);
//
//        // TODO: move to recycle bin first
//
//        InstanceMaker instanceMaker = findInstanceMaker(id);
//
//        em.remove(instanceMaker);
//      return instanceMaker;
//    }

}
