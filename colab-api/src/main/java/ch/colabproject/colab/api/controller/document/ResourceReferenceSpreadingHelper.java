/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardTypeRef;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.document.Resourceable;
import ch.colabproject.colab.api.persistence.jpa.card.CardTypeDao;
import ch.colabproject.colab.api.persistence.jpa.document.ResourceDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import javax.inject.Inject;

/**
 * Resource and resource reference spread specific logic
 *
 * @author sandra
 */
public class ResourceReferenceSpreadingHelper {

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Resource persistence handler
     */
    @Inject
    private ResourceDao resourceDao;

    /**
     * Card type persistence handler
     */
    @Inject
    private CardTypeDao cardTypeDao;

    /**
     * TO sudo
     */
    @Inject
    private RequestManager requestManager;

    // *********************************************************************************************
    // when a resource / resource reference is added, spread it down stream with references
    // *********************************************************************************************

    /**
     * Each child of the resource owner acquires a reference to the resource.
     *
     * @param resourceOrRef the resource to reference
     */
    public void spreadAvailableResourceDown(AbstractResource resourceOrRef) {
        if (resourceOrRef.getAbstractCardType() != null) {
            requestManager.sudo(() -> {
                AbstractCardType resourceOwner = resourceOrRef.getAbstractCardType();

                for (AbstractCardType cardTypeRef : cardTypeDao
                    .findDirectReferences(resourceOwner)) {
                    makeActiveReference(cardTypeRef, resourceOrRef);
                }

                for (Card implementingCard : resourceOwner.getImplementingCards()) {
                    makeActiveReference(implementingCard, resourceOrRef);
                }
            });
        }

        if (resourceOrRef.getCard() != null) {
            Card resourceOwner = resourceOrRef.getCard();

            for (CardContent variant : resourceOwner.getContentVariants()) {
                makeActiveReference(variant, resourceOrRef);
            }
        }

        if (resourceOrRef.getCardContent() != null) {
            CardContent resourceOwner = resourceOrRef.getCardContent();

            for (Card subCard : resourceOwner.getSubCards()) {
                makeActiveReference(subCard, resourceOrRef);
            }
        }
    }

    // *********************************************************************************************
    // when a card type reference / card / card content is added,
    // initialize the references from parent's resources / resource references
    // *********************************************************************************************

    /**
     * Create a resource reference for each resource / resource reference of the parent.
     *
     * @param cardTypeRefToFill A card type reference that need references to the up stream
     *                          resources
     *
     * @return the resource references that have been created or revived (or let as it is if nothing
     *         is needed)
     */
    public List<ResourceRef> extractReferencesFromUp(CardTypeRef cardTypeRefToFill) {
        AbstractCardType targetType = cardTypeRefToFill.getTarget();
        List<ResourceRef> refs = new ArrayList<>();

        for (AbstractResource targetResourceOrRef : targetType.getDirectAbstractResources()) {
            ResourceRef ref = makeActiveReference(cardTypeRefToFill, targetResourceOrRef);
            if (ref != null) {
                refs.add(ref);
            }
        }

        return refs;
    }

    /**
     * Create a resource reference for each resource / resource reference of the parent.
     *
     * @param cardToFill A card that need references to the up stream resources
     */
    public void extractReferencesFromUp(Card cardToFill) {
        CardContent parent = cardToFill.getParent();

        for (AbstractResource parentResourceOrRef : parent.getDirectAbstractResources()) {
            makeActiveReference(cardToFill, parentResourceOrRef);
        }

        if (cardToFill.hasCardType()) {
            AbstractCardType type = cardToFill.getCardType();

            for (AbstractResource typeResourceOrRef : type.getDirectAbstractResources()) {
                makeActiveReference(cardToFill, typeResourceOrRef);
            }
        }
    }

    /**
     * Create a resource reference for each resource / resource reference of the parent.
     *
     * @param cardContentToFill A card content that need references to the up stream resources
     */
    public void extractReferencesFromUp(CardContent cardContentToFill) {
        Card parent = cardContentToFill.getCard();

        for (AbstractResource parentResourceOrRef : parent.getDirectAbstractResources()) {
            makeActiveReference(cardContentToFill, parentResourceOrRef);
        }
    }

    // *********************************************************************************************
    // do it
    // *********************************************************************************************

    /**
     * If the given target resource (or reference) can have references, ensure that there is an
     * active reference to the given target resource (or reference) for the given owner.
     * <p>
     * For that either be sure the already existing reference for the owner and targeting the same
     * final resource is active or make a new reference.
     *
     * @param owner               the owner of the wanted reference
     * @param targetResourceOrRef the target of the wanted reference
     *
     * @return the resource reference that has been created or revived (or let as it is if nothing
     *         is needed)
     */
    private ResourceRef makeActiveReference(Resourceable owner,
        AbstractResource targetResourceOrRef) {

        if (mustHaveReferences(targetResourceOrRef)) {

            ResourceRef existingMatchingReference = findMatchingResourceRef(owner,
                targetResourceOrRef);

            if (existingMatchingReference != null) {
                ResourceRef aimedResourceRef = reviveAndRetarget(existingMatchingReference,
                    targetResourceOrRef);

                spreadAvailableResourceDown(aimedResourceRef);

                return aimedResourceRef;

            } else {
                ResourceRef aimedResourceRef = initNewReference(owner, targetResourceOrRef);

                spreadAvailableResourceDown(aimedResourceRef);

                return aimedResourceRef;
            }
        }

        return null;
    }

    /**
     * Ascertain if there must be resource references down stream for the given target resource (or
     * reference).
     *
     * @param targetResourceOrRef Resource / resource reference
     *
     * @return true iff the resource can have references
     */
    private boolean mustHaveReferences(AbstractResource targetResourceOrRef) {
        Resource concreteTargetResource = targetResourceOrRef.resolve();

        // do not spread unpublished resource
        if (concreteTargetResource != null && !concreteTargetResource.isPublished()) {
            // unless between a card and its card contents
            boolean isResourceLinkedToACard = (targetResourceOrRef instanceof Resource)
                && targetResourceOrRef.getCard() != null;
            if (!isResourceLinkedToACard) {
                return false;
            }
        }

        // do not spread references of a type from a card content to its sub cards
        boolean isResourceOrRefLinkedToACardContent = targetResourceOrRef.getCardContent() != null;
        if (isResourceOrRefLinkedToACardContent) {

            boolean isConcreteResourceLinkedToACardType = concreteTargetResource != null
                && concreteTargetResource.getAbstractCardType() != null;

            return !isConcreteResourceLinkedToACardType;
        }

        // in all other cases, spread
        return true;
    }

    /**
     * Search for an existing resource reference owned by the given owner and targeting the same
     * final resource as the given target.
     * <p>
     * It ensures that the matching reference is unique.
     *
     * @param owner               the owner of the wanted reference
     * @param targetResourceOrRef the target of the wanted reference
     *
     * @return the matching resource reference
     */
    private ResourceRef findMatchingResourceRef(Resourceable owner,
        AbstractResource targetResourceOrRef) {
        List<ResourceRef> refsOfOwnerWithSameFinalTarget = owner.getDirectAbstractResources()
            .stream()
            .filter(resOrRef -> resOrRef instanceof ResourceRef)
            .map(resOrRef -> (ResourceRef) resOrRef)
            .filter(ref -> Objects.equals(ref.resolve(), targetResourceOrRef.resolve()))
            .collect(Collectors.toList());

        if (refsOfOwnerWithSameFinalTarget.size() == 1) {
            return refsOfOwnerWithSameFinalTarget.get(0);
        }

        if (refsOfOwnerWithSameFinalTarget.size() > 1) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        return null;
    }

    /**
     * Update the given resource reference so that it is not set as residual, make the same for its
     * descendants. Make the given resource reference target the given target.
     * <p>
     * It can be done only if the resource reference and the new target have the same final concrete
     * resource.
     *
     * @param resourceReference the resource reference to update
     * @param newDirectTarget   the new target of the resource reference
     *
     * @return the resource reference that has been revived (or let as it is if nothing is needed)
     */
    private ResourceRef reviveAndRetarget(ResourceRef resourceReference,
        AbstractResource newDirectTarget) {
        if (!Objects.equals(resourceReference.resolve(), newDirectTarget.resolve())) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        // revive
        resourceReference.setResidual(false);

        // retarget
        AbstractResource olderTarget = resourceReference.getTarget();

        if (!Objects.equals(olderTarget, newDirectTarget)) {
            resourceReference.setTarget(newDirectTarget);
        }

        return resourceReference;
    }

    /**
     * Make a new resource reference to link to the given owner, targeting the given resource (or
     * reference).
     *
     * @param owner         the entity the new resource reference will be linked to
     * @param resourceOrRef the resource (or reference) target of the new resource reference
     *
     * @return the resource reference that has been created
     */
    private ResourceRef initNewReference(Resourceable owner, AbstractResource targetResourceOrRef) {
        ResourceRef newRef = initNewReferenceFrom(targetResourceOrRef);

        newRef.setOwner(owner);
        owner.getDirectAbstractResources().add(newRef);

        newRef.setTarget(targetResourceOrRef);

        return newRef;

        // no need to persist, it will be done all at once
    }

    /**
     * Initialize a new reference which will have the given resource (or reference) as target.
     *
     * @param targetResourceOrRef The target of the new resource reference
     *
     * @return the new resource reference
     */
    private ResourceRef initNewReferenceFrom(AbstractResource targetResourceOrRef) {
        ResourceRef newRef = new ResourceRef();

        newRef.setCategory(targetResourceOrRef.getCategory());

        if (targetResourceOrRef instanceof ResourceRef) {
            ResourceRef targetResourceRef = (ResourceRef) targetResourceOrRef;

            newRef.setRefused(targetResourceRef.isRefused());
            newRef.setResidual(targetResourceRef.isResidual());
        }

        return newRef;
    }

    // *********************************************************************************************
    // when something is moved, mark the former ancestors resource references as residual
    // when something is un-published, mark the resource references as residual
    // *********************************************************************************************

    /**
     * Each resource reference of the given owner that is linked to a resource of the given former
     * related is marked as residual. As well as all its descendants.
     *
     * @param owner         the owner of the resource references to mark
     * @param formerRelated the not-any-more-related target of the references
     */
    public void spreadDisableResourceDown(Resourceable owner, Resourceable formerRelated) {
        owner.getDirectAbstractResources().stream()
            .filter(resOrRef -> (resOrRef instanceof ResourceRef))
            .map(resOrRef -> ((ResourceRef) resOrRef))
            .filter(ref -> Objects.equals(ref.getTarget().getOwner(), formerRelated))
            .forEach(ref -> markAsResidualRecursively(ref, true));
    }

    /**
     * Disable = mark as residual.
     * <p>
     * Mark the resource's references as residual. Do it as well for all descendants.
     *
     * @param resource the resource
     */
    public void spreadDisableResourceDown(Resource resource) {
        requestManager.sudo(() -> {
            for (ResourceRef childRef : resourceDao.findDirectReferences(resource)) {
                markAsResidualRecursively(childRef, false);
            }
        });
    }

    /**
     * Disable = mark as residual.
     * <p>
     * Mark the resource's references as residual. Do it as well for all descendants.
     *
     * @param resource the resource
     * @param alwaysMark        if the reference must for sure be marked as residual
     */
    public void spreadDisableResourceDown(Resource resource, boolean alwaysMark) {
        requestManager.sudo(() -> {
            for (ResourceRef childRef : resourceDao.findDirectReferences(resource)) {
                markAsResidualRecursively(childRef, alwaysMark);
            }
        });
    }

    /**
     * Mark the resource reference as residual. Do it as well for all its descendants.
     *
     * @param resourceReference the reference to update
     * @param alwaysMark        if the reference must for sure be marked as residual
     */
    private void markAsResidualRecursively(ResourceRef resourceReference, boolean alwaysMark) {
        if (alwaysMark || resourceReference.getTarget() == null
            || !mustHaveReferences(resourceReference.getTarget())) {
            resourceReference.setResidual(true);
        }

        requestManager.sudo(() -> {
            for (ResourceRef childRef : resourceDao.findDirectReferences(resourceReference)) {
                markAsResidualRecursively(childRef, alwaysMark);
            }
        });
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

    /**
     * Mark the resource reference as refused. Do it as well for all its descendants.
     *
     * @param resourceReference the reference to update
     */
    public void refuseRecursively(ResourceRef resourceReference) {
        resourceReference.setRefused(true);

        requestManager.sudo(() -> {
            for (ResourceRef childRef : resourceDao.findDirectReferences(resourceReference)) {
                refuseRecursively(childRef);
            }
        });
    }

    /**
     * Mark the resource reference as not refused. Do it as well for all its descendants.
     *
     * @param resourceReference the reference to update
     */
    public void unRefuseRecursively(ResourceRef resourceReference) {
        resourceReference.setRefused(false);

        requestManager.sudo(() -> {
            for (ResourceRef childRef : resourceDao.findDirectReferences(resourceReference)) {
                unRefuseRecursively(childRef);
            }
        });
    }

    /**
     * Mark the resource reference as not residual. Do it as well for all its descendants.
     *
     * @param resourceReference the reference to update
     */
    public void reviveRecursively(ResourceRef resourceReference) {
        if (resourceReference.getTarget() != null
            && mustHaveReferences(resourceReference.getTarget())) {
            resourceReference.setResidual(false);
        }

        requestManager.sudo(() -> {
            for (ResourceRef childRef : resourceDao.findDirectReferences(resourceReference)) {
                reviveRecursively(childRef);
            }
        });
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
