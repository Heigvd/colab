/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.CardContent;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Card persistence
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
     * Get the list of all card contents
     *
     * @return list of all card contents
     */
    // FIXME sandra - Replace by something useful
    public List<CardContent> getAllCardContent() {
        logger.debug("get all card contents");
        TypedQuery<CardContent> query = em.createNamedQuery("CardContent.findAll",
            CardContent.class);
        return query.getResultList();
    }

    /**
     * @param id id of the card content to fetch
     *
     * @return the card content with the given id or null if such a card content does not exists
     */
    public CardContent getCardContent(Long id) {
        logger.debug("get card content #{}", id);
        return em.find(CardContent.class, id);
    }

    /**
     * Persist a brand new card content to database
     *
     * @param cardContent new card content to persist
     *
     * @return the new persisted card content
     */
    public CardContent createCardContent(CardContent cardContent) {
        logger.debug("create card content {}", cardContent);
        em.persist(cardContent);
        return cardContent;
    }

    /**
     * Update card content
     *
     * @param cardContent card content as supply by clients (ie not managed)
     *
     * @return updated managed card content
     *
     * @throws ColabMergeException if updating the card content failed
     */
    public CardContent updateCardContent(CardContent cardContent) throws ColabMergeException {
        logger.debug("update card content {}", cardContent);
        CardContent mCardContent = this.getCardContent(cardContent.getId());

        mCardContent.merge(cardContent);

        return mCardContent;
    }

    /**
     * Delete card content from database. This can't be undone
     *
     * @param id id of the card content to delete
     *
     * @return just deleted card content
     */
    public CardContent deleteCardContent(Long id) {
        logger.debug("delete card content #{}", id);
        // TODO: move to recycle bin first
        CardContent cardContent = this.getCardContent(id);
        em.remove(cardContent);
        return cardContent;
    }

}
