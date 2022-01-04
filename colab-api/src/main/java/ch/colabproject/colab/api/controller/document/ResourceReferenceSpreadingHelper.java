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
import java.util.List;

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
     * Each child of the card type acquires a reference to the resource.
     *
     * @param cardTypeOrRef the card type or card type reference
     * @param resourceOrRef the resource we are linking
     */
    public static void spreadReferenceDown(AbstractCardType cardTypeOrRef,
        AbstractResource resourceOrRef) {
        if (mustSpreadReferenceDown(resourceOrRef)) {
            for (AbstractCardType cardTypeRef : cardTypeOrRef.getDirectReferences()) {
                makeResourceReference(cardTypeRef, resourceOrRef);
            }

            for (Card card : cardTypeOrRef.getImplementingCards()) {
                makeResourceReference(card, resourceOrRef);
            }
        }
    }

    /**
     * Each child of the card acquires a reference to the resource.
     *
     * @param card          the card
     * @param resourceOrRef the resource we are linking
     */
    public static void spreadReferenceDown(Card card, AbstractResource resourceOrRef) {
        if (mustSpreadReferenceDown(resourceOrRef)) {
            for (CardContent cardContent : card.getContentVariants()) {
                makeResourceReference(cardContent, resourceOrRef);
            }
        }
    }

    /**
     * Each child of the card content acquires a reference to the resource.
     *
     * @param cardContent   the card content
     * @param resourceOrRef the resource we are linking
     */
    public static void spreadReferenceDown(CardContent cardContent,
        AbstractResource resourceOrRef) {
        if (mustSpreadReferenceDown(resourceOrRef)) {
            for (Card card : cardContent.getSubCards()) {
                makeResourceReference(card, resourceOrRef);
            }
        }
    }

    // *********************************************************************************************
    // when a card type reference / card / card content is added,
    // initialize the references from parent's resources / resource references
    // *********************************************************************************************

    /**
     * Create a resource reference for each resource / resource reference of the parent that must be
     * spread
     *
     * @param cardTypeRefToFill A new card type reference that need references to the up stream
     *                          resources
     */
    public static void spreadResourcesFromUp(CardTypeRef cardTypeRefToFill) {
        AbstractCardType target = cardTypeRefToFill.getTarget();

        for (AbstractResource targetResource : target.getDirectAbstractResources()) {
            if (mustSpreadReferenceDown(targetResource)) {
                makeResourceReference(cardTypeRefToFill, targetResource);
            }
        }
    }

    /**
     * Create a resource reference for each resource / resource reference of the parent that must be
     * spread
     *
     * @param cardToFill A new card that need references to the up stream resources
     */
    public static void spreadResourcesFromUp(Card cardToFill) {
        CardContent parent = cardToFill.getParent();

        for (AbstractResource parentResource : parent.getDirectAbstractResources()) {
            if (mustSpreadReferenceDown(parentResource)) {
                makeResourceReference(cardToFill, parentResource);
            }
        }

        AbstractCardType type = cardToFill.getCardType();

        for (AbstractResource typeResource : type.getDirectAbstractResources()) {
            if (mustSpreadReferenceDown(typeResource)) {
                makeResourceReference(cardToFill, typeResource);
            }
        }
    }

    /**
     * Create a resource reference for each resource / resource reference of the parent that must be
     * spread
     *
     * @param cardContentToFill A new card content that need references to the up stream resources
     */
    public static void spreadResourcesFromUp(CardContent cardContentToFill) {
        Card parent = cardContentToFill.getCard();

        List<AbstractResource> parentResources = parent.getDirectAbstractResources();
        for (AbstractResource parentResource : parentResources) {
            if (mustSpreadReferenceDown(parentResource)) {
                makeResourceReference(cardContentToFill, parentResource);
            }
        }
    }

    // *********************************************************************************************
    // do it
    // *********************************************************************************************

    /**
     * Ascertain if we must create resource references down stream
     *
     * @param resourceOrRef Resource / resource reference
     *
     * @return True iff the resource must be spread down
     */
    private static boolean mustSpreadReferenceDown(AbstractResource resourceOrRef) {
        // do not spread references of a type from a card content to its sub cards
        boolean isResourceOrRefLinkedToACardContent = resourceOrRef.hasCardContent();
        if (isResourceOrRefLinkedToACardContent) {
            Resource concreteResource = resourceOrRef.resolve();

            boolean isConcreteResourceLinkedToACardType = concreteResource != null
                && concreteResource.hasAbstractCardType();

            return !isConcreteResourceLinkedToACardType;
        }

        // in all other cases, spread
        return true;
    }

    /**
     * Make a resource reference to link to the given owner, from the given resource or reference
     * (or reference)
     *
     * @param owner         the entity the new resource reference will be linked to
     * @param resourceOrRef the resource (or reference) target of the new resource reference
     */
    private static void makeResourceReference(AbstractCardType owner,
        AbstractResource resourceOrRef) {

        ResourceRef resourceRef = initNewReferenceFrom(resourceOrRef);

        resourceRef.setAbstractCardType(owner);
        owner.getDirectAbstractResources().add(resourceRef);

        spreadReferenceDown(owner, resourceRef);
    }

    /**
     * Make a resource reference to link to the given owner, from the given resource or reference
     * (or reference)
     *
     * @param owner         the entity the new resource reference will be linked to
     * @param resourceOrRef the resource (or reference) target of the new resource reference
     */
    private static void makeResourceReference(CardContent owner, AbstractResource resourceOrRef) {
        ResourceRef resourceRef = initNewReferenceFrom(resourceOrRef);

        resourceRef.setCardContent(owner);
        owner.getDirectAbstractResources().add(resourceRef);

        spreadReferenceDown(owner, resourceRef);
    }

    /**
     * Make a resource reference to link to the given owner, from the given resource or reference
     * (or reference)
     *
     * @param owner         the entity the new resource reference will be linked to
     * @param resourceOrRef the resource (or reference) target of the new resource reference
     */
    private static void makeResourceReference(Card owner, AbstractResource resourceOrRef) {
        ResourceRef resourceRef = initNewReferenceFrom(resourceOrRef);

        resourceRef.setCard(owner);
        owner.getDirectAbstractResources().add(resourceRef);

        spreadReferenceDown(owner, resourceRef);
    }

    /**
     * Initialize a new reference to the target resource / resource reference
     *
     * @param target Base resource / resource reference
     *
     * @return the new resource reference
     */
    private static ResourceRef initNewReferenceFrom(AbstractResource target) {
        ResourceRef reference = new ResourceRef();

        reference.setCategory(target.getCategory());

        reference.setRefused(isNewReferenceInitiallyRefused(target));

        reference.setTarget(target);
        target.getDirectReferences().add(reference);

        return reference;
    }

    /**
     * Determine if the new reference must be initiated as refused
     *
     * @param target Base resource / resource reference
     *
     * @return how the new reference refused field must be initialized
     */
    private static boolean isNewReferenceInitiallyRefused(AbstractResource target) {
        if (target instanceof ResourceRef) {
            // if it is from a reference, just copy the refused state
            return ((ResourceRef) target).isRefused();
        }

        // if it is from a concrete resource, set to true if deprecated
        if (target instanceof Resource && ((Resource) target).resolve().isDeprecated()) {
            return true;
        }

        return false;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
