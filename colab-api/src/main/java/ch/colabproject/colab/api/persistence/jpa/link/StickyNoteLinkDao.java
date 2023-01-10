/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
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
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
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
     * Find a link by id
     *
     * @param id the id of the link to fetch
     *
     * @return the link with the given id or null if such a link does not exist
     */
    public StickyNoteLink findStickyNoteLink(Long id) {
        logger.trace("find sticky note link #{}", id);

        return em.find(StickyNoteLink.class, id);
    }

    /**
     * Update sticky note link. Only fields which are editable by users will be impacted.
     *
     * @param link the sticky note link as supplied by clients (ie not managed by JPA)
     *
     * @return return updated managed sticky note link
     *
     * @throws ColabMergeException if the update failed
     */
    public StickyNoteLink updateStickyNoteLink(StickyNoteLink link) throws ColabMergeException {
        logger.trace("update sticky note link {}", link);

        StickyNoteLink managedStickyNoteLink = this.findStickyNoteLink(link.getId());

        managedStickyNoteLink.merge(link);

        return managedStickyNoteLink;
    }

    /**
     * Persist a brand new link to database
     *
     * @param link the new link to persist
     *
     * @return the new persisted and managed link
     */
    public StickyNoteLink persistStickyNoteLink(StickyNoteLink link) {
        logger.trace("persist sticky note link {}", link);

        em.persist(link);

        return link;
    }

    /**
     * Delete the link from database. This can't be undone
     *
     * @param link the link to delete
     */
    public void deleteStickyNoteLink(StickyNoteLink link) {
        logger.trace("delete sticky note link {}", link);

        // TODO: move to recycle bin first

        em.remove(link);
    }

}
