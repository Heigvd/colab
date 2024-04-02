/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.link;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 * Activity flow link persistence
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class ActivityFlowLinkDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ActivityFlowLinkDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find a link by id
     *
     * @param id the id of the link to fetch
     *
     * @return the link with the given id or null if such a link does not exist
     */
    public ActivityFlowLink findActivityFlowLink(Long id) {
        logger.trace("find activity flow link #{}", id);

        return em.find(ActivityFlowLink.class, id);
    }

    /**
     * Update activity flow link. Only fields which are editable by users will be impacted.
     *
     * @param link the activity flow link as supplied by clients (ie not managed by JPA)
     *
     * @return return updated managed activity flow link
     *
     * @throws ColabMergeException if the update failed
     */
    public ActivityFlowLink updateActivityFlowLink(ActivityFlowLink link) throws ColabMergeException {
        logger.trace("update activity flow link {}", link);

        ActivityFlowLink managedActivityFlowLink = this.findActivityFlowLink(link.getId());

        managedActivityFlowLink.mergeToUpdate(link);

        return managedActivityFlowLink;
    }

    /**
     * Persist a brand new link to database
     *
     * @param link the new link to persist
     *
     * @return the new persisted and managed link
     */
    public ActivityFlowLink persistActivityFlowLink(ActivityFlowLink link) {
        logger.trace("persist activity flow link {}", link);

        em.persist(link);

        return link;
    }

    /**
     * Delete the link from database. This can't be undone
     *
     * @param link the link to delete
     */
    public void deleteActivityFlowLink(ActivityFlowLink link) {
        logger.trace("delete activity flow link {}", link);

        em.remove(link);
    }

}
