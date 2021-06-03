/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.card;

import ch.colabproject.colab.api.ejb.SecurityFacade;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.user.User;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
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
public class CardTypeDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardTypeDao.class);

    /**
     * ACL purpose
     */
    @Inject
    private SecurityFacade securityFacade;

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
    public List<CardType> getAllCardType() {
        logger.debug("get all card defs");
        TypedQuery<CardType> query = em.createNamedQuery("CardType.findAll", CardType.class);
        return query.getResultList();
    }

    /**
     * Get the list of global card defs
     *
     * @return list of global card defs
     */
    public List<CardType> getGlobalCardType() {
        logger.debug("get all global card defs");
        TypedQuery<CardType> query = em.createNamedQuery("CardType.findGlobals", CardType.class);
        return query.getResultList();
    }

    /**
     * Get the list of published global card defs
     *
     * @return list of published global card defs
     */
    public List<CardType> getPublishedGlobalCardType() {
        logger.debug("get published  global card defs");
        TypedQuery<CardType> query = em.createNamedQuery("CardType.findPublishedGlobals", CardType.class);
        return query.getResultList();
    }

    /**
     * Get the list of non-global published card types accessible to the current user
     *
     * @return list of published non-global card types accessible to the current user
     */
    public List<AbstractCardType> getPublishedProjectsCardType() {
        logger.debug("get published  global card defs");
        User user = securityFacade.assertAndGetCurrentUser();
        TypedQuery<AbstractCardType> query = em.createNamedQuery("CardType.findPublishedFromProjects", AbstractCardType.class);
        query.setParameter("userId", user.getId());
        return query.getResultList();
    }

    /**
     * @param id id of the card def to fetch
     *
     * @return the card def with the given id or null if such a card def does not exists
     */
    public AbstractCardType getAbstractCardType(Long id) {
        logger.debug("get abstract card def #{}", id);
        return em.find(AbstractCardType.class, id);
    }

    /**
     * @param id id of the card def to fetch
     *
     * @return the card def with the given id or null if such a card def does not exists
     */
    public CardType getCardType(Long id) {
        logger.debug("get card def #{}", id);
        return em.find(CardType.class, id);
    }

    /**
     * Persist a brand new card def to database
     *
     * @param cardType new card def to persist
     *
     * @return the new persisted card def
     */
    public AbstractCardType createCardType(AbstractCardType cardType) {
        logger.debug("create card def {}", cardType);
        em.persist(cardType);
        em.flush();
        return cardType;
    }

    /**
     * Update card def
     *
     * @param cardType card def as supply by clients (ie not managed)
     *
     * @return updated managed card def
     *
     * @throws ColabMergeException if updating the card def failed
     */
    public CardType updateCardType(CardType cardType) throws ColabMergeException {
        logger.debug("update card def {}", cardType);
        CardType mCardType = this.getCardType(cardType.getId());

        mCardType.merge(cardType);

        return mCardType;
    }

    /**
     * Delete card def from database. This can't be undone
     *
     * @param id id of the card def to delete
     *
     * @return just deleted card def
     */
    public CardType deleteCardType(Long id) {
        logger.debug("delete card def #{}", id);
        // TODO: move to recycle bin first
        CardType cardType = this.getCardType(id);
        em.remove(cardType);
        return cardType;
    }

}
