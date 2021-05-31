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
 * Card type persistence
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
     * Get the list of all card types
     *
     * @return list of all card types
     */
    public List<CardType> getAllCardType() {
        logger.debug("get all card types");
        TypedQuery<CardType> query = em.createNamedQuery("CardType.findAll", CardType.class);
        return query.getResultList();
    }

    /**
     * Get the list of global card types
     *
     * @return list of global card types
     */
    public List<CardType> getGlobalCardType() {
        logger.debug("get all global card types");
        TypedQuery<CardType> query = em.createNamedQuery("CardType.findGlobals", CardType.class);
        return query.getResultList();
    }

    /**
     * Get the list of published global card types
     *
     * @return list of published global card types
     */
    public List<CardType> getPublishedGlobalCardType() {
        logger.debug("get published  global card types");
        TypedQuery<CardType> query = em.createNamedQuery("CardType.findPublishedGlobals", CardType.class);
        return query.getResultList();
    }

    /**
     * Get the list of non-global published card types accessible to the current user
     *
     * @return list of published non-global card types accessible to the current user
     */
    public List<CardType> getPublishedProjectsCardType() {
        logger.debug("get published  global card types");
        User user = securityFacade.assertAndGetCurrentUser();
        TypedQuery<CardType> query = em.createNamedQuery("CardType.findPublishedFromProjects", CardType.class);
        query.setParameter("userId", user.getId());
        return query.getResultList();
    }

    /**
     * @param id id of the card type to fetch
     *
     * @return the card type with the given id or null if such a card type does not exists
     */
    public AbstractCardType getAbstractCardType(Long id) {
        logger.debug("get abstract card type #{}", id);
        return em.find(AbstractCardType.class, id);
    }

    /**
     * @param id id of the card type to fetch
     *
     * @return the card type with the given id or null if such a card type does not exists
     */
    public CardType getCardType(Long id) {
        logger.debug("get card type #{}", id);
        return em.find(CardType.class, id);
    }

    /**
     * Persist a brand new card type to database
     *
     * @param cardType new card type to persist
     *
     * @return the new persisted card type
     */
    public AbstractCardType createCardType(AbstractCardType cardType) {
        logger.debug("create card type {}", cardType);
        em.persist(cardType);
        em.flush();
        return cardType;
    }

    /**
     * Update card type
     *
     * @param cardType card type as supply by clients (ie not managed)
     *
     * @return updated managed card type
     *
     * @throws ColabMergeException if updating the card type failed
     */
    public CardType updateCardType(CardType cardType) throws ColabMergeException {
        logger.debug("update card type {}", cardType);
        CardType mCardType = this.getCardType(cardType.getId());

        mCardType.merge(cardType);

        return mCardType;
    }

    /**
     * Delete card type from database. This can't be undone
     *
     * @param id id of the card type to delete
     *
     * @return just deleted card type
     */
    public CardType deleteCardType(Long id) {
        logger.debug("delete card type #{}", id);
        // TODO: move to recycle bin first
        CardType cardType = this.getCardType(id);
        em.remove(cardType);
        return cardType;
    }

}
