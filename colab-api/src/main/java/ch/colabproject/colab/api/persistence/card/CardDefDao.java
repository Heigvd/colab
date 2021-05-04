/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.CardDef;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Card def persistence
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class CardDefDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardDefDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Get the list of all card defs
     *
     * @return list of all card defs
     */
    public List<CardDef> getAllCardDef() {
        logger.debug("get all card defs");
        TypedQuery<CardDef> query = em.createNamedQuery("CardDef.findAll", CardDef.class);
        return query.getResultList();
    }

    /**
     * @param id id of the card def to fetch
     *
     * @return the card def with the given id or null if such a card def does not exists
     */
    public CardDef getCardDef(Long id) {
        logger.debug("get card def #{}", id);
        return em.find(CardDef.class, id);
    }

    /**
     * Persist a brand new card def to database
     *
     * @param cardDef new card def to persist
     *
     * @return the new persisted card def
     */
    public CardDef createCardDef(CardDef cardDef) {
        logger.debug("create card def {}", cardDef);
        em.persist(cardDef);
        return cardDef;
    }

    /**
     * Update card def
     *
     * @param cardDef card def as supply by clients (ie not managed)
     *
     * @return updated managed card def
     *
     * @throws ColabMergeException if updating the card def failed
     */
    public CardDef updateCardDef(CardDef cardDef) throws ColabMergeException {
        logger.debug("update card def {}", cardDef);
        CardDef mCardDef = this.getCardDef(cardDef.getId());

        mCardDef.merge(cardDef);

        return mCardDef;
    }

    /**
     * Delete card def from database. This can't be undone
     *
     * @param id id of the card def to delete
     *
     * @return just deleted card def
     */
    public CardDef deleteCardDef(Long id) {
        logger.debug("delete card def #{}", id);
        // TODO: move to recycle bin first
        CardDef cardDef = this.getCardDef(id);
        em.remove(cardDef);
        return cardDef;
    }

}
