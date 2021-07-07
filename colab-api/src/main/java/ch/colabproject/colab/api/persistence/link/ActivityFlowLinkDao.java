/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.link;

import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Activity flow link persistence
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
     * @param id the id of the link to fetch
     *
     * @return the link with the given id or null if such a link does not exists
     */
    public ActivityFlowLink findActivityFlowLink(Long id) {
        try {
            logger.debug("find activity flow link #{}", id);
            return em.find(ActivityFlowLink.class, id);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

//    /**
//     * Update link
//     *
//     * @param link the link as supply by clients (ie not managed)
//     *
//     * @return the updated managed link
//     *
//     * @throws ColabMergeException if updating the link failed
//     */
//    public ActivityFlowLink updateActivityFlowLink(ActivityFlowLink link)
//        throws ColabMergeException {
//        logger.debug("update activity flow link {}", link);
//        ActivityFlowLink mLink = this.findActivityFlowLink(link.getId());
//        mLink.merge(link);
//        return mLink;
//    }

    /**
     * Persist a brand new link to database
     *
     * @param link the new link to persist
     *
     * @return the new persisted link
     */
    public ActivityFlowLink persistActivityFlowLink(ActivityFlowLink link) {
        logger.debug("persist activity flow link {}", link);
        em.persist(link);
        return link;
    }

    /**
     * Delete link from database. This can't be undone
     *
     * @param id the id of the link to delete
     *
     * @return just deleted link
     */
    public ActivityFlowLink deleteActivityFlowLink(Long id) {
        logger.debug("delete activity flow link #{}", id);
        // TODO: move to recycle bin first
        ActivityFlowLink link = this.findActivityFlowLink(id);
        em.remove(link);
        return link;
    }

}
