/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.card;

import ch.colabproject.colab.api.ejb.SecurityFacade;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.card.CardTypeDao;
import com.google.common.collect.Lists;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.ListUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Card type and reference specific logic
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class CardTypeManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardTypeManager.class);

    // *********************************************************************************************
    // injections

    /**
     * Card type persistence handling
     */
    @Inject
    private CardTypeDao cardTypeDao;

    /**
     * Access control manager
     */
    @Inject
    private SecurityFacade securityFacade;

    // *********************************************************************************************
    // Access control
    // *********************************************************************************************

    /**
     * Retrieve the ids of the global (not in a project) published card types.
     *
     * @return the ids of the matching card types
     */
    public List<Long> findGlobalPublishedCardTypeIds() {
        return cardTypeDao.getPublishedGlobalCardTypeIds();
    }

    /**
     * Retrieve the id of the all the card types the current user can read.
     * <p>
     * That means every card type (or reference) owned by a project the current user is member of
     * and all the targets of these.
     *
     * @return the ids of the matching card types or references
     */
    public List<Long> findCurrentUserReadableProjectsCardTypesIds() {
        List<Long> directInOwnProjects = findCurrentUserDirectProjectsCardTypesIds();
        return retrieveDirectAndTransitiveCardTypesOrRefs(directInOwnProjects);
    }

    /**
     * Retrieve the ids of the card types (or references) owned by a project the current user is a
     * member of
     *
     * @return the ids of the matching card types or references
     */
    private List<Long> findCurrentUserDirectProjectsCardTypesIds() {
        User user = securityFacade.assertAndGetCurrentUser();

        List<Long> cardTypeOrRefIds = cardTypeDao.getUserProjectCardTypeIds(user.getId());

        logger.debug("found direct project's card types' id : {} ", cardTypeOrRefIds);

        return cardTypeOrRefIds;
    }

    /**
     * Retrieve the ids of the card types or references with their direct and transitive targets.
     *
     * @param cardTypeOrRefIds
     *
     * @return
     */
    private List<Long> retrieveDirectAndTransitiveCardTypesOrRefs(List<Long> cardTypeOrRefIds) {
        return retrieveDirectAndTransitiveCardTypesOrRefs(cardTypeOrRefIds, Lists.newArrayList());
    }

    /**
     * Retrieve the ids of the card types or references with their direct and transitive targets.
     *
     * @param toProcess   the ids of card types and references
     * @param alreadyDone the already processed ids
     *
     * @return the ids of the matching card types or references
     */
    private List<Long> retrieveDirectAndTransitiveCardTypesOrRefs(List<Long> toProcess,
        List<Long> alreadyDone) {
        List<Long> remainsToProcess = ListUtils.removeAll(toProcess, alreadyDone);
        if (CollectionUtils.isEmpty(remainsToProcess)) {
            return alreadyDone;
        }

        alreadyDone.addAll(remainsToProcess);

        List<Long> directTargets = findDirectTargets(remainsToProcess);
        alreadyDone.addAll(directTargets);
        retrieveDirectAndTransitiveCardTypesOrRefs(directTargets, alreadyDone);

        return alreadyDone;
    }

    /**
     * Retrieve the ids of the direct target of each card type or reference
     *
     * @param cardTypeOrRefIds the ids of card types and references
     *
     * @return the ids of the matching card types or references
     */
    private List<Long> findDirectTargets(List<Long> cardTypeOrRefIds) {
        List<Long> result = cardTypeDao.getTargetIdsOf(cardTypeOrRefIds);
        logger.debug("found targets : {} ", result);
        return result;
    }

    /**
     * Retrieve the ids of the projects owning any card type or reference.
     *
     * @param cardTypeOrRefIds the ids of card types and references
     *
     * @return the ids of the matching projects
     */
    public List<Long> findProjectIdsFromCardTypeIds(List<Long> cardTypeOrRefIds) {
        return cardTypeDao.getProjectIdsOf(cardTypeOrRefIds);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
