/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.card;

import ch.colabproject.colab.api.ejb.ProjectFacade;
import ch.colabproject.colab.api.ejb.SecurityFacade;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.card.CardTypeRef;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.card.CardTypeDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.ListUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.google.common.collect.Lists;

/**
 * Card type and reference specific logic
 *
 * @author maxence
 * @author sandra
 */
@Stateless
@LocalBean
public class CardTypeManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardTypeManager.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Access control manager
     */
    @Inject
    private SecurityFacade securityFacade;

    /**
     * Card type persistence handler
     */
    @Inject
    private CardTypeDao cardTypeDao;

    /**
     * Project specific logic management
     */
    @Inject
    private ProjectFacade projectManager;

    // *********************************************************************************************
    // find card types
    // *********************************************************************************************

    /**
     * Retrieve the card type (or reference). If not found, throw a {@link HttpErrorMessage}.
     *
     * @param cardTypeOrRefId the id of the card type (or reference)
     *
     * @return the card type (or reference) if found
     *
     * @throws HttpErrorMessage if the card type (or reference) was not found
     */
    public AbstractCardType assertAndGetCardTypeOrRef(Long cardTypeOrRefId) {
        AbstractCardType cardTypeOrRef = cardTypeDao.getAbstractCardType(cardTypeOrRefId);

        if (cardTypeOrRef == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return cardTypeOrRef;
    }

    /**
     * Expand project own types.
     *
     * @param project type owner
     *
     * @return set of concrete types and all transitive ref to reach them
     */
    public Set<AbstractCardType> getExpandedProjectTypes(Project project) {
        return this.expand(project.getElementsToBeDefined());
    }

    /**
     * Expand all type that belong to a project and the current user has access to
     *
     * @return set of concrete types and all transitive ref to reach them
     */
    public Set<AbstractCardType> getExpandedProjectPublishedTypes() {
        return this.expand(cardTypeDao.getPublishedProjectsCardType());
    }

    /**
     * Expand given types
     *
     * @param types to expand
     *
     * @return all types and all transitive ref to reach them
     */
    private Set<AbstractCardType> expand(List<AbstractCardType> types) {
        Set<AbstractCardType> allTypes = new HashSet<>();
        types.forEach(type -> {
            allTypes.addAll(type.expand());
        });

        return allTypes;
    }

    // *********************************************************************************************
    // life cycle
    // *********************************************************************************************

    /**
     * Complete and persist the given new card type.
     * <p>
     * The new type is a global type if it is not bound to any project.
     *
     * @param cardType the type to persist
     *
     * @return the new persisted card type
     */
    public CardType createCardType(CardType cardType) {
        Long projectId = cardType.getProjectId();

        if (projectId != null) {
            logger.debug("create a card type in the project #{}", projectId);

            Project project = projectManager.assertAndGetProject(projectId);

            project.getElementsToBeDefined().add(cardType);
            cardType.setProject(project);
        } else {
            logger.debug("create a global card type");
            cardType.setProject(null);
        }

        if (cardType.getPurpose() == null) {
            cardType.setPurpose(Block.initNewDefaultBlock());
        }

        cardTypeDao.createCardType(cardType);

        return cardType;
    }

    /**
     * Delete the given card type
     *
     * @param cardTypeId the id of the card type to delete
     *
     * @return the freshly deleted card
     */
    public CardType deleteCardType(Long cardTypeId) {
        logger.debug("delete card type {}", cardTypeId);

        AbstractCardType cardTypeOrRef = assertAndGetCardTypeOrRef(cardTypeId);

        if (!checkDeletionAcceptability(cardTypeOrRef)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        if (cardTypeOrRef.getProject() != null) {
            cardTypeOrRef.getProject().getElementsToBeDefined().remove(cardTypeOrRef);
        }

        return cardTypeDao.deleteCardType(cardTypeId);
    }

    /**
     * Ascertain that the card type (or reference) can be deleted.
     *
     * @param cardTypeOrRef the card type (or reference) to check for deletion
     *
     * @return True iff it can be safely deleted
     */
    private boolean checkDeletionAcceptability(AbstractCardType cardTypeOrRef) {
        if (CollectionUtils.isNotEmpty(cardTypeOrRef.getImplementingCards())) {
            return false;
        }

        if (CollectionUtils.isNotEmpty(cardTypeOrRef.getDirectReferences())) {
            return false;
        }

        return true;
    }

    // *********************************************************************************************
    // dedicated to access control
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
    // integrity check
    // *********************************************************************************************

    /**
     * Check the integrity of the card type (or reference)
     *
     * @param cardTypeOrRef the card type (or reference) to check
     *
     * @return true iff the project is complete and safe
     */
    public boolean checkIntegrity(AbstractCardType cardTypeOrRef) {
        if (cardTypeOrRef == null) {
            return false;
        }

        if (cardTypeOrRef instanceof CardTypeRef) {
            CardTypeRef reference = (CardTypeRef) cardTypeOrRef;
            CardType finalTarget = reference.resolve();
            if (finalTarget == null) {
                return false;
            }
        }

        return true;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
