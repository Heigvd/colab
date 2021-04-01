/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.Card;
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
public class CardDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Get the list of all cards
     *
     * @return list of all cards
     */
    // FIXME sandra - See if really needed
    public List<Card> getAllCard() {
        logger.debug("get all cards");
        TypedQuery<Card> query = em.createNamedQuery("Card.findAll", Card.class);
        return query.getResultList();
    }

    /**
     *
     * @param id id of the card to fetch
     *
     * @return the card with the given id or null if such a card does not exists
     */
    public Card getCard(Long id) {
        logger.debug("get card #" + id);
        return em.find(Card.class, id);
    }

    /**
     * Persist a brand new card to database
     *
     * @param card new card to persist
     *
     * @return the new persisted card
     */
    public Card createCard(Card card) {
        logger.debug("create card");
        em.persist(card);
        return card;
    }

    /**
     * Update card
     *
     * @param card card as supply by clients (ie not managed)
     *
     * @return return updated managed card
     *
     * @throws ColabMergeException if updating the card failed
     */
    public Card updateCard(Card card) throws ColabMergeException {
        logger.debug("update card #" + card.getId());
        Card mCard = this.getCard(card.getId());

        mCard.merge(card);

        return mCard;
    }

    /**
     * Delete card from database. This can't be undone
     *
     * @param id id of the card to delete
     *
     * @return just deleted card
     */
    public Card deleteCard(Long id) {
        logger.debug("delete card #" + id);
        // TODO: move to recycle bin first
        Card card = this.getCard(id);
        em.remove(card);
        return card;
    }

}
