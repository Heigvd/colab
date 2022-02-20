/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.Card;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Card persistence
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class CardDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * @param id id of the card to fetch
     *
     * @return the card with the given id or null if such a card does not exists
     */
    public Card findCard(Long id) {
        logger.debug("get card #{}", id);
        return em.find(Card.class, id);
    }

    /**
     * Update card
     *
     * @param card card as supply by clients (ie not managed)
     *
     * @return updated managed card
     *
     * @throws ColabMergeException if updating the card failed
     */
    public Card updateCard(Card card) throws ColabMergeException {
        logger.debug("update card {}", card);
        Card mCard = this.findCard(card.getId());
        mCard.merge(card);
        return mCard;
    }

    /**
     * Persist a brand new card to database
     *
     * @param card new card to persist
     *
     * @return the new persisted card
     */
    public Card persistCard(Card card) {
        logger.debug("persist card {}", card);
        em.persist(card);
        return card;
    }

    /**
     * Delete card from database. This can't be undone
     *
     * @param id id of the card to delete
     *
     * @return just deleted card
     */
    public Card deleteCard(Long id) {
        logger.debug("delete card #{}", id);
        // TODO: move to recycle bin first
        Card card = this.findCard(id);
        em.remove(card);
        return card;
    }

}
