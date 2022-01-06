/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardTypeRef;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.document.Resourceable;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Resource and resource reference spread specific logic
 *
 * @author sandra
 */
public final class ResourceReferenceSpreadingHelper {

    private ResourceReferenceSpreadingHelper() {
        throw new UnsupportedOperationException("do not instantiate a utility class");
    }

    // *********************************************************************************************
    // when a resource / resource reference is added, spread it down stream with references
    // *********************************************************************************************

    /**
     * Each child of the resource owner acquires a reference to the resource.
     *
     * @param resourceOrRef the resource to reference
     */
    public static void spreadNewResourceDown(AbstractResource resourceOrRef) {
        if (resourceOrRef.getAbstractCardType() != null) {
            AbstractCardType resourceOwner = resourceOrRef.getAbstractCardType();

            for (AbstractCardType cardTypeRef : resourceOwner.getDirectReferences()) {
                makeActiveReference(cardTypeRef, resourceOrRef);
            }

            for (Card implementingCard : resourceOwner.getImplementingCards()) {
                makeActiveReference(implementingCard, resourceOrRef);
            }
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
     */
    public static void extractReferencesFromUp(CardTypeRef cardTypeRefToFill) {
        AbstractCardType targetType = cardTypeRefToFill.getTarget();

        for (AbstractResource targetResourceOrRef : targetType.getDirectAbstractResources()) {
            makeActiveReference(cardTypeRefToFill, targetResourceOrRef);
        }
    }

    /**
     * Create a resource reference for each resource / resource reference of the parent.
     *
     * @param cardToFill A card that need references to the up stream resources
     */
    public static void extractReferencesFromUp(Card cardToFill) {
        CardContent parent = cardToFill.getParent();

        for (AbstractResource parentResourceOrRef : parent.getDirectAbstractResources()) {
            makeActiveReference(cardToFill, parentResourceOrRef);
        }

        AbstractCardType type = cardToFill.getCardType();

        for (AbstractResource typeResourceOrRef : type.getDirectAbstractResources()) {
            makeActiveReference(cardToFill, typeResourceOrRef);
        }
    }

    /**
     * Create a resource reference for each resource / resource reference of the parent.
     *
     * @param cardContentToFill A card content that need references to the up stream resources
     */
    public static void extractReferencesFromUp(CardContent cardContentToFill) {
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
     */
    private static void makeActiveReference(Resourceable owner,
        AbstractResource targetResourceOrRef) {

        if (canHaveReferences(targetResourceOrRef)) {

            ResourceRef existingMatchingReference = findMatchingResourceRef(owner,
                targetResourceOrRef);

            if (existingMatchingReference != null) {
                reviveAndRetarget(existingMatchingReference, targetResourceOrRef);
            } else {
                makeNewReference(owner, targetResourceOrRef);
            }
        }
    }

    /**
     * Ascertain if we must create resource references down stream for the given target resource (or
     * reference).
     *
     * @param targetResourceOrRef Resource / resource reference
     *
     * @return true iff the resource can have references
     */
    private static boolean canHaveReferences(AbstractResource targetResourceOrRef) {
        // do not spread references of a type from a card content to its sub cards
        boolean isResourceOrRefLinkedToACardContent = targetResourceOrRef.getCardContent() != null;
        if (isResourceOrRefLinkedToACardContent) {
            Resource concreteTargetResource = targetResourceOrRef.resolve();

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
    private static ResourceRef findMatchingResourceRef(Resourceable owner,
        AbstractResource targetResourceOrRef) {
        List<ResourceRef> refsOfOwnerWithSameFinalTarget = owner.getDirectAbstractResources()
            .stream()
            .filter(resOrRef -> resOrRef instanceof ResourceRef)
            .map(resOrRef -> (ResourceRef) resOrRef)
            .filter(resOrRef -> Objects.equals(resOrRef.resolve(), targetResourceOrRef.resolve()))
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
     * @param newTarget         the new target of the resource reference
     */
    private static void reviveAndRetarget(ResourceRef resourceReference,
        AbstractResource newTarget) {
        if (!Objects.equals(resourceReference.resolve(), newTarget.resolve())) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        activateRecursively(resourceReference);

        AbstractResource olderTarget = resourceReference.getTarget();

        if (!Objects.equals(olderTarget, newTarget)) {
            resourceReference.setTarget(newTarget);
            newTarget.getDirectReferences().add(resourceReference);

            olderTarget.getDirectReferences().remove(resourceReference);
        }
    }

    /**
     * Set "residual" to false for the given reference and recursively for all its references.
     *
     * @param resourceReference the reference to update
     */
    private static void activateRecursively(ResourceRef resourceReference) {
        resourceReference.setResidual(false);

        for (ResourceRef childRef : resourceReference.getDirectReferences()) {
            activateRecursively(childRef);
        }
    }

    /**
     * Make a new resource reference to link to the given owner, targeting the given resource (or
     * reference).
     *
     * @param owner         the entity the new resource reference will be linked to
     * @param resourceOrRef the resource (or reference) target of the new resource reference
     */
    private static void makeNewReference(Resourceable owner, AbstractResource targetResourceOrRef) {
        ResourceRef newRef = initNewReferenceFrom(targetResourceOrRef);

        newRef.setOwner(owner);
        owner.getDirectAbstractResources().add(newRef);

        newRef.setTarget(targetResourceOrRef);
        targetResourceOrRef.getDirectReferences().add(newRef);

        spreadNewResourceDown(newRef);

        // no need to persist, it will be done at once
    }

    /**
     * Initialize a new reference which will have the given resource (or reference) as target.
     *
     * @param targetResourceOrRef The target of the new resource reference
     *
     * @return the new resource reference
     */
    private static ResourceRef initNewReferenceFrom(AbstractResource targetResourceOrRef) {
        ResourceRef newRef = new ResourceRef();

        newRef.setCategory(targetResourceOrRef.getCategory());

        newRef.setRefused(isNewReferenceInitiallyRefused(targetResourceOrRef));

        if (targetResourceOrRef instanceof ResourceRef) {
            newRef.setResidual(((ResourceRef) targetResourceOrRef).isResidual());
        }

        return newRef;
    }

    /**
     * Determine if the new reference must be initiated as refused.
     *
     * @param targetResource the target resource of the new reference
     *
     * @return how the new reference refused field must be initialized
     */
    private static boolean isNewReferenceInitiallyRefused(AbstractResource targetResource) {
        if (targetResource instanceof ResourceRef) {
            // if it is from a reference, just copy the refused state
            return ((ResourceRef) targetResource).isRefused();
        }

        if (targetResource instanceof Resource) {
            // if it is from a concrete resource, set to true if deprecated
            Resource targetConcreteResource = (Resource) targetResource;
            if (targetConcreteResource.isDeprecated()) {
                return true;
            }
        }

        return false;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
