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
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Instance maker persistence
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
//     * @param instanceMakerId the id of the instance maker
//     *
//     * @return the instance maker or null if it does not exist
//     */
//    public InstanceMaker findInstanceMaker(Long instanceMakerId) {
//        return em.find(InstanceMaker.class, instanceMakerId);
//    }
//
//    /**
//     * Update an instance maker
//     *
//     * @param instanceMaker new value
//     *
//     * @return updated instance maker
//     *
//     * @throws ColabMergeException if updated failed
//     */
//    public InstanceMaker updateInstanceMaker(InstanceMaker instanceMaker)
//        throws ColabMergeException {
//        InstanceMaker managedInstanceMaker = findInstanceMaker(instanceMaker.getId());
//        if (managedInstanceMaker == null) {
//            throw HttpErrorMessage.relatedObjectNotFoundError();
//        }
//        managedInstanceMaker.merge(instanceMaker);
//
//        return managedInstanceMaker;
//    }

    /**
     * Persist a brand new instance maker to database
     *
     * @param instancemaker new instance maker to persist
     *
     * @return the new persisted instance maker
     */
    public InstanceMaker persistInstanceMaker(InstanceMaker instancemaker) {
        logger.debug("persist instance maker {}", instancemaker);
        em.persist(instancemaker);
        return instancemaker;
    }
//
//    /**
//     * Remove the given instance maker from database
//     *
//     * @param instanceMaker the instance maker to delete
//     */
//    public void removeInstanceMaker(InstanceMaker instanceMaker) {
//        em.remove(instanceMaker);
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
//
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
}
