/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.card;

import ch.colabproject.colab.api.ejb.SecurityFacade;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.user.User;
import com.google.common.collect.Lists;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import liquibase.repackaged.org.apache.commons.collections4.CollectionUtils;
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
        logger.debug("get published global card types");
        TypedQuery<CardType> query = em.createNamedQuery("CardType.findPublishedGlobals",
            CardType.class);
        return query.getResultList();
    }

    /**
     * Get the list of the id of the published global card types
     *
     * @return list of ids corresponding to the global published card types
     */
    public List<Long> getPublishedGlobalCardTypeIds() {
        logger.debug("get published global card type ids");
        TypedQuery<Long> query = em.createNamedQuery("CardType.findIdOfPublishedGlobals",
            Long.class);
        return query.getResultList();
    }

    /**
     * Get the list of non-global published card types accessible to the current user
     *
     * @return list of published non-global card types accessible to the current user
     */
    public List<AbstractCardType> getPublishedProjectsCardType() {
        logger.debug("get published global card types");

        User user = securityFacade.assertAndGetCurrentUser();
        TypedQuery<AbstractCardType> query = em
            .createNamedQuery("CardType.findPublishedFromProjects", AbstractCardType.class);
        query.setParameter("userId", user.getId());
        return query.getResultList();
    }

    /**
     * Retrieve the ids of the card types directly linked to a project the user is a team member of
     *
     * @param userId the id of the user
     *
     * @return the ids of the matching card types or references
     */
    public List<Long> getUserProjectCardTypeIds(Long userId) {
        logger.debug("get the ids of the card types in the projects the user is a team member of");

        TypedQuery<Long> query = em
            .createNamedQuery("AbstractCardType.findIdOfUserProjectDirectCardType", Long.class);
        query.setParameter("userId", userId);
        return query.getResultList();
    }

    /**
     * Retrieve the direct target of each card type or reference.
     * <p>
     * Done for several entities to be more efficient.
     *
     * @param cardTypeOrRefIds the ids of the card types or references (can contain card types,
     *                         there just will be no result for these)
     *
     * @return the ids of matching card types or references
     */
    public List<Long> getTargetIdsOf(List<Long> cardTypeOrRefIds) {
        logger.debug("get the target's ids");
        if (CollectionUtils.isEmpty(cardTypeOrRefIds)) {
            return Lists.newArrayList();
        }
        TypedQuery<Long> query = em.createNamedQuery("CardTypeRef.getTargetIds", Long.class);
        query.setParameter("initIds", cardTypeOrRefIds);
        return query.getResultList();
    }

    /**
     * Retrieve the projects owning the card types or references.
     * <p>
     * Done for several entities to be more efficient.
     *
     * @param cardTypeOrRefIds the ids of the card types or references
     *
     * @return the ids of the matching projects
     */
    public List<Long> getProjectIdsOf(List<Long> cardTypeOrRefIds) {
        logger.debug("get the project's id");
        if (CollectionUtils.isEmpty(cardTypeOrRefIds)) {
            return Lists.newArrayList();
        }
        TypedQuery<Long> query = em.createNamedQuery("AbstractCardType.getProjectId", Long.class);
        query.setParameter("listId", cardTypeOrRefIds);
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
    public AbstractCardType updateCardType(AbstractCardType cardType) throws ColabMergeException {
        logger.debug("update card type {}", cardType);
        AbstractCardType mCardType = this.getAbstractCardType(cardType.getId());

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
