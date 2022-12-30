/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.card;

import ch.colabproject.colab.api.controller.document.BlockManager;
import ch.colabproject.colab.api.controller.document.ResourceReferenceSpreadingHelper;
import ch.colabproject.colab.api.controller.project.ProjectManager;
import ch.colabproject.colab.api.controller.security.SecurityManager;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.card.CardTypeRef;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.card.CardTypeDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
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
    private SecurityManager securityManager;

    /**
     * Card type persistence handler
     */
    @Inject
    private CardTypeDao cardTypeDao;

    /**
     * Project specific logic management
     */
    @Inject
    private ProjectManager projectManager;

    /**
     * Block logic manager
     */
    @Inject
    private BlockManager blockManager;

    /**
     * Resource reference spreading specific logic handling
     */
    @Inject
    private ResourceReferenceSpreadingHelper resourceReferenceSpreadingHelper;

    // *********************************************************************************************
    // find card types and references
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
        AbstractCardType cardTypeOrRef = cardTypeDao.findAbstractCardType(cardTypeOrRefId);

        if (cardTypeOrRef == null) {
            logger.error("card type or reference #{} not found", cardTypeOrRefId);
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return cardTypeOrRef;
    }

    /**
     * Retrieve the card type. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param cardTypeId the id of the card type
     *
     * @return the card type if found
     *
     * @throws HttpErrorMessage if the card type was not found
     */
    public CardType assertAndGetCardType(Long cardTypeId) {
        AbstractCardType cardTypeOrRef = assertAndGetCardTypeOrRef(cardTypeId);

        if (!(cardTypeOrRef instanceof CardType)) {
            logger.error("#{} is not a card type", cardTypeId);
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return (CardType) cardTypeOrRef;
    }

    /**
     * Retrieve the card type reference. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param cardTypeRefId the id of the card type reference
     *
     * @return the card type reference if found
     *
     * @throws HttpErrorMessage if the card type reference was not found
     */
    public CardTypeRef assertAndGetCardTypeRef(Long cardTypeRefId) {
        AbstractCardType cardTypeOrRef = assertAndGetCardTypeOrRef(cardTypeRefId);

        if (!(cardTypeOrRef instanceof CardTypeRef)) {
            logger.error("#{} is not a card type reference", cardTypeRefId);
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return (CardTypeRef) cardTypeOrRef;
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
    public Set<AbstractCardType> getCurrentUserExpandedPublishedProjectTypes() {
        User user = securityManager.assertAndGetCurrentUser();
        return this.expand(cardTypeDao.findPublishedProjectCardTypes(user.getId()));
    }

    /**
     * Get the abstract card type and expand it
     *
     * @param id the id of the wanted abstract card type
     *
     * @return the corresponding abstract card type and all its targets recursively until the card
     *         type
     */
    public List<AbstractCardType> getExpandedCardType(Long id) {
        AbstractCardType wanted = cardTypeDao.findAbstractCardType(id);
        return wanted.expand();
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
            TextDataBlock purposeTextDataBlock = blockManager.makeNewTextDataBlock();

            cardType.setPurpose(purposeTextDataBlock);
            purposeTextDataBlock.setPurposingCardType(cardType);
        }

        return cardTypeDao.persistAbstractCardType(cardType);
    }

    // TODO sandra work in progress - still need to be sharpened
    /**
     * If the card type is not already in the project, create a reference to it. Else simply return
     * the card type.
     *
     * @param cardTypeId the id of the target card type
     * @param projectId  the id of the project in which we want to use the card type
     *
     * @return The reference to the card type
     */
    public AbstractCardType useCardTypeInProject(Long cardTypeId, Long projectId) {
        AbstractCardType cardTypeOrRef = assertAndGetCardTypeOrRef(cardTypeId);
        Project project = projectManager.assertAndGetProject(projectId);

        return computeEffectiveCardTypeOrRef(cardTypeOrRef, project);
    }

    /**
     * Remove the card type use of the project. That means delete the reference in the project if it
     * has no usage. If the abstract card type is used, throws an error.
     *
     * @param cardTypeId the id of the card type reference no more useful for the project
     * @param projectId  the id of the project in which we don't want to use the card type anymore
     */
    public void removeCardTypeRefFromProject(Long cardTypeId, Long projectId) {
        CardTypeRef cardTypeOrRef = assertAndGetCardTypeRef(cardTypeId);
        Project project = projectManager.assertAndGetProject(projectId);

        if (!(project.getElementsToBeDefined().contains(cardTypeOrRef))) {
            // the job is already done
            return;
        }

        deleteCardTypeOrRef(cardTypeOrRef);
    }

    /**
     * Delete the given card type
     *
     * @param cardTypeId the id of the card type to delete
     */
    public void deleteCardType(Long cardTypeId) {
        CardType cardType = assertAndGetCardType(cardTypeId);

        deleteCardTypeOrRef(cardType);
    }

    /**
     * Delete the given card type
     *
     * @param cardTypeId the id of the card type to delete
     */
    private void deleteCardTypeOrRef(AbstractCardType cardTypeOrRef) {
        if (!checkDeletionAcceptability(cardTypeOrRef)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        if (cardTypeOrRef.getProject() != null) {
            cardTypeOrRef.getProject().getElementsToBeDefined().remove(cardTypeOrRef);
        }

        cardTypeDao.deleteAbstractCardType(cardTypeOrRef);
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

        if (CollectionUtils.isNotEmpty(cardTypeDao.findDirectReferences(cardTypeOrRef))) {
            return false;
        }

        return true;
    }

    // *********************************************************************************************
    // reference handling
    // *********************************************************************************************

    /**
     * Get a card type located in the given project and targeting the given card type.
     *
     * @param cardType the target card type
     * @param project  the project the card type is located
     *
     * @return the unique card type
     */
    public AbstractCardType computeEffectiveCardTypeOrRef(AbstractCardType cardType,
        Project project) {
        // The given type belongs to the project
        // it can be used as-is
        if (project.equals(cardType.getProject())) {
            return cardType;
        }

        // So, cardType belongs to another project or is global
        // it must be accessed via a reference belonging to the given project

        // Check if the project already got a direct reference the super-type
        // shall we check something to prevent extending same type several times?
        Optional<AbstractCardType> directRefToCardTypeInProject = project.getElementsToBeDefined()
            .stream()
            .filter(type -> {
                return isDirectRef(type, cardType);
            })
            .findFirst();

        // direct reference found, reuse it
        if (directRefToCardTypeInProject.isPresent()) {
            return directRefToCardTypeInProject.get();
        }

        // no direct reference. Create one.
        return createNewCardReference(cardType, project);
    }

    /**
     * Is the given child a direct reference to the given parent.
     *
     * @param child  the child
     * @param parent the parent
     *
     * @return true if child is a direct reference to the parent
     */
    private boolean isDirectRef(AbstractCardType child, AbstractCardType parent) {
        if (child instanceof CardTypeRef) {
            CardTypeRef ref = (CardTypeRef) child;
            AbstractCardType refTarget = ref.getTarget();
            return Objects.equals(refTarget, parent);
        }

        return false;
    }

    /**
     * Complete and persist a new type reference to the given type. The ref will belongs to the
     * given project.
     *
     * @param cardType the type to reference
     * @param project  the reference owner
     *
     * @return a new, initialized card type reference (just the object, no persistence)
     *
     * @throws HttpErrorMessage if we try to create a reference in the same project than the target
     */
    private CardTypeRef createNewCardReference(AbstractCardType cardType, Project project) {
        if (cardType.getProjectId() == project.getId()) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        CardTypeRef ref = initNewCardTypeRef();

        ref.setProject(project);
        project.getElementsToBeDefined().add(ref);

        ref.setTarget(cardType);

        resourceReferenceSpreadingHelper.extractReferencesFromUp(ref);

        return cardTypeDao.persistAbstractCardType(ref);
    }

    /**
     * Initialize a new card type reference
     *
     * @return a new, initialized card type reference (just the object, no persistence)
     */
    private CardTypeRef initNewCardTypeRef() {
        CardTypeRef ref = new CardTypeRef();

        ref.setDeprecated(false);
        ref.setPublished(false);

        return ref;
    }

    /**
     * Is the given ancestor an ancestor of the given child
     *
     * @param child    the child
     * @param ancestor the ancestor
     *
     * @return true if child is a ref and if ancestor is an ancestor of the ref
     */
    public boolean isTransitiveRef(AbstractCardType child, AbstractCardType ancestor) {
        if (isDirectRef(child, ancestor)) {
            return true;
        } else if (child instanceof CardTypeRef) {
            AbstractCardType parent = ((CardTypeRef) child).getTarget();
            return this.isTransitiveRef(parent, ancestor);
        }

        return false;
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
        return cardTypeDao.findIdsOfPublishedGlobalCardTypes();
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
        List<Long> result = Lists.newArrayList();

        List<Long> directInOwnProjects = findCurrentUserDirectProjectsCardTypesIds();
        List<Long> above = retrieveDirectAndTransitiveAboveCardTypesOrRefs(directInOwnProjects);
        List<Long> below = retrieveDirectAndTransitiveBelowCardTypesOrRefs(directInOwnProjects);

        result.addAll(directInOwnProjects);
        result.addAll(above);
        result.addAll(below);

        return result;
    }

    /**
     * Retrieve the ids of the card types (or references) owned by a project the current user is a
     * member of
     *
     * @return the ids of the matching card types or references
     */
    private List<Long> findCurrentUserDirectProjectsCardTypesIds() {
        User user = securityManager.assertAndGetCurrentUser();

        List<Long> cardTypeOrRefIds = cardTypeDao.findIdsOfProjectCardType(user.getId());

        logger.debug("found direct project's card types' id : {} ", cardTypeOrRefIds);

        return cardTypeOrRefIds;
    }

    /**
     * Retrieve the ids of the card types or references with their direct and transitive targets.
     *
     * @param cardTypeOrRefIds
     *
     * @return the ids of the matching card types or references
     */
    private List<Long> retrieveDirectAndTransitiveAboveCardTypesOrRefs(
        List<Long> cardTypeOrRefIds) {
        return retrieveDirectAndTransitiveAboveCardTypesOrRefs(cardTypeOrRefIds,
            Lists.newArrayList());
    }

    /**
     * Retrieve the ids of the card types or references with their direct and transitive targets.
     *
     * @param toProcess   the ids of card types and references
     * @param alreadyDone the already processed ids
     *
     * @return the ids of the matching card types or references
     */
    private List<Long> retrieveDirectAndTransitiveAboveCardTypesOrRefs(List<Long> toProcess,
        List<Long> alreadyDone) {
        List<Long> remainsToProcess = ListUtils.removeAll(toProcess, alreadyDone);
        if (CollectionUtils.isEmpty(remainsToProcess)) {
            return alreadyDone;
        }

        alreadyDone.addAll(remainsToProcess);

        List<Long> directTargets = findDirectTargets(remainsToProcess);
        retrieveDirectAndTransitiveAboveCardTypesOrRefs(directTargets, alreadyDone);

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
        List<Long> result = cardTypeDao.findTargetIdsOf(cardTypeOrRefIds);
        logger.debug("found targets : {} ", result);
        return result;
    }

    /**
     * Retrieve the ids of the card types or references with their direct and transitive references.
     *
     * @param cardTypeOrRefIds
     *
     * @return the ids of the matching card types or references
     */
    private List<Long> retrieveDirectAndTransitiveBelowCardTypesOrRefs(
        List<Long> cardTypeOrRefIds) {
        return retrieveDirectAndTransitiveBelowCardTypesOrRefs(cardTypeOrRefIds,
            Lists.newArrayList());
    }

    /**
     * Retrieve the ids of the card types or references with their direct and transitive references.
     *
     * @param toProcess   the ids of card types and references
     * @param alreadyDone the already processed ids
     *
     * @return the ids of the matching card types or references
     */
    private List<Long> retrieveDirectAndTransitiveBelowCardTypesOrRefs(List<Long> toProcess,
        List<Long> alreadyDone) {
        List<Long> remainsToProcess = ListUtils.removeAll(toProcess, alreadyDone);
        if (CollectionUtils.isEmpty(remainsToProcess)) {
            return alreadyDone;
        }

        alreadyDone.addAll(remainsToProcess);

        List<Long> directRefs = findDirectRefs(remainsToProcess);
        retrieveDirectAndTransitiveBelowCardTypesOrRefs(directRefs, alreadyDone);

        return alreadyDone;
    }

    /**
     * Retrieve the ids of the direct references of each card type or reference
     *
     * @param cardTypeOrRefIds the ids of card types and references
     *
     * @return the ids of the matching card types or references
     */
    private List<Long> findDirectRefs(List<Long> cardTypeOrRefIds) {
        List<Long> result = cardTypeDao.findDirectReferencesIdsOf(cardTypeOrRefIds);
        logger.debug("found refs : {}", result);
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
        return cardTypeDao.findProjectIdsOf(cardTypeOrRefIds);
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

        // just one ref by target/project

        return true;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
