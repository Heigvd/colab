/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.card;

import ch.colabproject.colab.api.ejb.SecurityFacade;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.AbstractCardDef;
import ch.colabproject.colab.api.model.card.CardDef;
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
public class CardDefDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardDefDao.class);

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
    public List<CardDef> getAllCardDef() {
        logger.debug("get all card defs");
        TypedQuery<CardDef> query = em.createNamedQuery("CardDef.findAll", CardDef.class);
        return query.getResultList();
    }

    /**
     * Get the list of global card defs
     *
     * @return list of global card defs
     */
    public List<CardDef> getGlobalCardDef() {
        logger.debug("get all global card defs");
        TypedQuery<CardDef> query = em.createNamedQuery("CardDef.findGlobals", CardDef.class);
        return query.getResultList();
    }

    /**
     * Get the list of published global card defs
     *
     * @return list of published global card defs
     */
    public List<CardDef> getPublishedGlobalCardDef() {
        logger.debug("get published  global card defs");
        TypedQuery<CardDef> query = em.createNamedQuery("CardDef.findPublishedGlobals", CardDef.class);
        return query.getResultList();
    }

    /**
     * Get the list of non-global published card types accessible to the current user
     *
     * @return list of published non-global card types accessible to the current user
     */
    public List<CardDef> getPublishedProjectsCardDef() {
        logger.debug("get published  global card defs");
        User user = securityFacade.assertAndGetCurrentUser();
        TypedQuery<CardDef> query = em.createNamedQuery("CardDef.findPublishedFromProjects", CardDef.class);
        query.setParameter("userId", user.getId());
        return query.getResultList();
    }

    /**
     * @param id id of the card def to fetch
     *
     * @return the card def with the given id or null if such a card def does not exists
     */
    public AbstractCardDef getAbstractCardDef(Long id) {
        logger.debug("get abstract card def #{}", id);
        return em.find(AbstractCardDef.class, id);
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
    public AbstractCardDef createCardDef(AbstractCardDef cardDef) {
        logger.debug("create card def {}", cardDef);
        em.persist(cardDef);
        em.flush();
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
