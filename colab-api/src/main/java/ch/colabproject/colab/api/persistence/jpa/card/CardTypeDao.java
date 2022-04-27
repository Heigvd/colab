/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.card.CardTypeRef;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.google.common.collect.Lists;

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
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Get the list of global card types
     *
     * @return list of global card types
     */
    public List<CardType> findGlobalCardTypes() {
        logger.debug("get all global card types");
        TypedQuery<CardType> query = em.createNamedQuery("CardType.findGlobals", CardType.class);
        return query.getResultList();
    }

    /**
     * Get the list of published global card types
     *
     * @return list of published global card types
     */
    public List<CardType> findPublishedGlobalCardTypes() {
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
    public List<Long> findIdsOfPublishedGlobalCardTypes() {
        logger.debug("get published global card type ids");
        TypedQuery<Long> query = em.createNamedQuery("CardType.findIdsOfPublishedGlobal",
            Long.class);
        return query.getResultList();
    }

    /**
     * Get the list of non-global published card types accessible to the current user
     *
     * @param userId the id of the user
     *
     * @return list of published non-global card types accessible to the current user
     */
    public List<AbstractCardType> findPublishedProjectCardTypes(Long userId) {
        logger.debug("get published card types in the projects the user is a team member of");

        TypedQuery<AbstractCardType> query = em
            .createNamedQuery("AbstractCardType.findPublishedByProjectTeamMemberUser",
                AbstractCardType.class);
        query.setParameter("userId", userId);
        return query.getResultList();
    }

    /**
     * Retrieve the ids of the card types directly linked to a project the user is a team member of
     *
     * @param userId the id of the user
     *
     * @return the ids of the matching card types or references
     */
    public List<Long> findIdsOfProjectCardType(Long userId) {
        logger.debug("get the ids of the card types in the projects the user is a team member of");

        TypedQuery<Long> query = em
            .createNamedQuery("AbstractCardType.findIdsByProjectTeamMemberUser", Long.class);
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
    public List<Long> findTargetIdsOf(List<Long> cardTypeOrRefIds) {
        logger.debug("get the target's ids");
        if (CollectionUtils.isEmpty(cardTypeOrRefIds)) {
            return Lists.newArrayList();
        }
        TypedQuery<Long> query = em.createNamedQuery("CardTypeRef.findTargetIds", Long.class);
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
    public List<Long> findProjectIdsOf(List<Long> cardTypeOrRefIds) {
        logger.debug("get the project's id");
        if (CollectionUtils.isEmpty(cardTypeOrRefIds)) {
            return Lists.newArrayList();
        }
        TypedQuery<Long> query = em.createNamedQuery("AbstractCardType.findProjectId", Long.class);
        query.setParameter("listId", cardTypeOrRefIds);
        return query.getResultList();
    }

    /**
     * Retrieve the card type references that have the given target
     *
     * @param target the target
     *
     * @return the matching references
     */
    public List<CardTypeRef> findDirectReferences(AbstractCardType target) {
        logger.debug("find the direct references of the target {}", target);

        TypedQuery<CardTypeRef> query = em.createNamedQuery("CardTypeRef.findDirectReferences",
            CardTypeRef.class);

        query.setParameter("targetId", target.getId());

        return query.getResultList();
    }

    /**
     * @param id id of the card type to fetch
     *
     * @return the card type with the given id or null if such a card type does not exists
     */
    public AbstractCardType findAbstractCardType(Long id) {
        logger.debug("get abstract card type #{}", id);
        return em.find(AbstractCardType.class, id);
    }

    /**
     * @param id id of the card type to fetch
     *
     * @return the card type with the given id or null if such a card type does not exists
     */
    private CardType findCardType(Long id) {
        logger.debug("get card type #{}", id);
        return em.find(CardType.class, id);
    }

    /**
     * Update card type
     *
     * @param <T>           a sub type of AbstractCardType
     * @param cardTypeOrRef card type as supply by clients (ie not managed)
     *
     * @return updated managed card type
     *
     * @throws ColabMergeException if updating the card type failed
     */
    public <T extends AbstractCardType> T updateAbstractCardType(T cardTypeOrRef)
        throws ColabMergeException {
        logger.debug("update card type {}", cardTypeOrRef);
        @SuppressWarnings("unchecked")
        T mCardType = (T) this.findAbstractCardType(cardTypeOrRef.getId());
        mCardType.merge(cardTypeOrRef);
        return mCardType;
    }

    /**
     * Persist a brand new card type to database
     *
     * @param <T>           a sub type of AbstractCardType
     * @param cardTypeOrRef new card type to persist
     *
     * @return the new persisted card type
     */
    public <T extends AbstractCardType> T persistAbstractCardType(T cardTypeOrRef) {
        logger.debug("persist card type {}", cardTypeOrRef);
        em.persist(cardTypeOrRef);
        return cardTypeOrRef;
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
        CardType cardType = this.findCardType(id);
        em.remove(cardType);
        return cardType;
    }

}
