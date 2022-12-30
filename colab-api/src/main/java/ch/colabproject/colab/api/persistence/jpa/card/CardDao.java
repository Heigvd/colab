/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
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
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
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
     * Find a card by id
     *
     * @param id the id of the card to fetch
     *
     * @return the card with the given id or null if such a card does not exist
     */
    public Card findCard(Long id) {
        logger.trace("find card #{}", id);

        return em.find(Card.class, id);
    }

    /**
     * Update card. Only fields which are editable by users will be impacted.
     *
     * @param card the card as supplied by clients (ie not managed by JPA)
     *
     * @return return updated managed card
     *
     * @throws ColabMergeException if the update failed
     */
    public Card updateCard(Card card) throws ColabMergeException {
        logger.trace("update card {}", card);

        Card managedCard = this.findCard(card.getId());

        managedCard.merge(card);

        return managedCard;
    }

    /**
     * Persist a brand new card to database
     *
     * @param card the new card to persist
     *
     * @return the new persisted and managed card
     */
    public Card persistCard(Card card) {
        logger.trace("persist card {}", card);

        em.persist(card);

        return card;
    }

    /**
     * Delete the card from database. This can't be undone
     *
     * @param card the card to delete
     */
    public void deleteCard(Card card) {
        logger.trace("delete card {}", card);

        // TODO: move to recycle bin first

        em.remove(card);
    }

}
