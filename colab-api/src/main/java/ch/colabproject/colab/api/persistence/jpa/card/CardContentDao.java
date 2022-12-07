/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.CardContent;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Card content persistence
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class CardContentDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardContentDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find a card content by id
     *
     * @param id the id of the card content to fetch
     *
     * @return the card content with the given id or null if such a card content does not exist
     */
    public CardContent findCardContent(Long id) {
        logger.trace("find card content #{}", id);

        return em.find(CardContent.class, id);
    }

    /**
     * Update card content. Only fields which are editable by users will be impacted.
     *
     * @param cardContent the card content as supplied by clients (ie not managed by JPA)
     *
     * @return return updated managed card content
     *
     * @throws ColabMergeException if the update failed
     */
    public CardContent updateCardContent(CardContent cardContent) throws ColabMergeException {
        logger.trace("update card content {}", cardContent);

        CardContent managedCardContent = this.findCardContent(cardContent.getId());

        managedCardContent.merge(cardContent);

        return managedCardContent;
    }

    /**
     * Persist a brand new card content to database
     *
     * @param cardContent the new card content to persist
     *
     * @return the new persisted and managed card content
     */
    public CardContent persistCardContent(CardContent cardContent) {
        logger.trace("persist card content {}", cardContent);

        em.persist(cardContent);

        return cardContent;
    }

    /**
     * Delete the card content from database. This can't be undone
     *
     * @param cardContent the card content to delete
     */
    public void deleteCardContent(CardContent cardContent) {
        logger.trace("delete card content {}", cardContent);

        // TODO: move to recycle bin first

        em.remove(cardContent);
    }

}
