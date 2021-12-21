/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.link;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Sticky note link persistence
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class StickyNoteLinkDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(StickyNoteLinkDao.class);

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
    public StickyNoteLink findStickyNoteLink(Long id) {
        try {
            logger.debug("find sticky note link #{}", id);
            return em.find(StickyNoteLink.class, id);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    /**
     * Update link
     *
     * @param link the link as supply by clients (ie not managed)
     *
     * @return the updated managed link
     *
     * @throws ColabMergeException if updating the link failed
     */
    public StickyNoteLink updateStickyNoteLink(StickyNoteLink link) throws ColabMergeException {
        logger.debug("update sticky note link {}", link);
        StickyNoteLink mLink = this.findStickyNoteLink(link.getId());
        mLink.merge(link);
        return mLink;
    }

    /**
     * Persist a brand new link to database
     *
     * @param link the new link to persist
     *
     * @return the new persisted link
     */
    public StickyNoteLink persistStickyNoteLink(StickyNoteLink link) {
        logger.debug("persist sticky note link {}", link);
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
    public StickyNoteLink deleteStickyNoteLink(Long id) {
        logger.debug("delete sticky note link #{}", id);
        // TODO: move to recycle bin first
        StickyNoteLink link = this.findStickyNoteLink(id);
        em.remove(link);
        return link;
    }

}
