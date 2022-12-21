/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.project;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.project.CopyParam;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Copy parameter persistence
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class CopyParamDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CopyParamDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find a copy parameter by id
     *
     * @param id the id of the copy parameter to fetch
     *
     * @return the copy parameter with the given id or null if it does not exist
     */
    private CopyParam findCopyParam(Long id) {
        logger.trace("find copy parameter #{}", id);

        return em.find(CopyParam.class, id);
    }

    /**
     * Get the copy parameter of a project id
     *
     * @param projectId the id of the project
     *
     * @return the copy parameter related to the project
     */
    public CopyParam findCopyParamByProject(Long projectId) {
        try {
            logger.trace("find copy param of project #{}", projectId);

            TypedQuery<CopyParam> query = em.createNamedQuery("CopyParam.findByProject",
                CopyParam.class);

            query.setParameter("projectId", projectId);

            return query.getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    /**
     * Update copy parameter. Only fields which are editable by users will be impacted.
     *
     * @param param the copy parameter as supplied by clients (ie not managed by JPA)
     *
     * @return return updated managed copy parameter
     *
     * @throws ColabMergeException if the update failed
     */
    public CopyParam updateCopyParam(CopyParam param) throws ColabMergeException {
        logger.trace("update copy param {}", param);

        CopyParam managedCopyParam = this.findCopyParam(param.getId());

        managedCopyParam.merge(param);

        return managedCopyParam;
    }

}
