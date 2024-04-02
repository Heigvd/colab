/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.project;

import ch.colabproject.colab.api.model.project.InstanceMaker;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.User;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

/**
 * Instance maker persistence
 * <p>
 * Note : Most database operations are handled by managed entities and cascade.
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class InstanceMakerDao {

    /**
     * logger
     */
    private static final Logger logger = LoggerFactory.getLogger(InstanceMakerDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find an instance maker by id
     *
     * @param id the id of the instance maker
     * @return the instance maker or null if it does not exist
     */
    public InstanceMaker findInstanceMaker(Long id) {
        logger.trace("find instance maker #{}", id);

        return em.find(InstanceMaker.class, id);
    }

    /**
     * Find the instance maker who match the given project and the given user.
     *
     * @param project the project
     * @param user    the user
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
     * Persist a brand-new instance maker to database
     *
     * @param instanceMaker the new instance maker to persist
     */
    public void persistInstanceMaker(InstanceMaker instanceMaker) {
        logger.trace("persist instance maker {}", instanceMaker);

        em.persist(instanceMaker);

    }

    /**
     * Delete the instance maker from database. This can't be undone
     *
     * @param instanceMaker the instance maker to delete
     */
    public void deleteInstanceMaker(InstanceMaker instanceMaker) {
        logger.trace("delete instance maker #{}", instanceMaker);

        em.remove(instanceMaker);
    }

}
