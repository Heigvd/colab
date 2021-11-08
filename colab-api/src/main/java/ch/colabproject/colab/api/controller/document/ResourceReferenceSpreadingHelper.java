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
        throw new UnsupportedOperationException();
    }

    // *********************************************************************************************
    // when a resource / resource reference is created, spread it down stream with references
    // *********************************************************************************************

    /**
     * Each child of the card type acquires a reference to the resource.
     *
     * @param cardTypeOrRef the card type or card type reference
     * @param resourceOrRef the resource we are linking
     */
    public static void spreadReferenceDown(AbstractCardType cardTypeOrRef,
        AbstractResource resourceOrRef) {
        if (mustSpreadReference(resourceOrRef)) {
            for (AbstractCardType cardTypeRef : cardTypeOrRef.getDirectReferences()) {
                ResourceRef resourceRef = initNewResourceRef();

                resourceRef.setTarget(resourceOrRef);
                resourceOrRef.getDirectReferences().add(resourceRef);

                resourceRef.setAbstractCardType(cardTypeRef);
                cardTypeRef.getDirectAbstractResources().add(resourceRef);

                spreadReferenceDown(cardTypeRef, resourceRef);
            }

            for (Card card : cardTypeOrRef.getImplementingCards()) {
                ResourceRef cardResourceRef = initNewResourceRef();

                cardResourceRef.setTarget(resourceOrRef);
                resourceOrRef.getDirectReferences().add(cardResourceRef);

                cardResourceRef.setCard(card);
                card.getDirectAbstractResources().add(cardResourceRef);

                spreadReferenceDown(card, cardResourceRef);
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
        if (mustSpreadReference(resourceOrRef)) {
            for (CardContent cardContent : card.getContentVariants()) {
                ResourceRef resourceRef = initNewResourceRef();

                resourceRef.setTarget(resourceOrRef);
                resourceOrRef.getDirectReferences().add(resourceRef);

                resourceRef.setCardContent(cardContent);
                cardContent.getDirectAbstractResources().add(resourceRef);

                spreadReferenceDown(cardContent, resourceRef);
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
        if (mustSpreadReference(resourceOrRef)) {
            for (Card card : cardContent.getSubCards()) {
                ResourceRef resourceRef = initNewResourceRef();

                resourceRef.setTarget(resourceOrRef);
                resourceOrRef.getDirectReferences().add(resourceRef);

                resourceRef.setCard(card);
                card.getDirectAbstractResources().add(resourceRef);

                spreadReferenceDown(card, resourceRef);
            }
        }
    }

    /**
     * Ascertain if we must create resource references down stream
     *
     * @param resourceOrRef Resource / resource reference
     *
     * @return True if the resource must be spread down
     */
    private static boolean mustSpreadReference(AbstractResource resourceOrRef) {
        // do not spread references of a type from a card content to its subcards
        if (resourceOrRef.hasCardContent()) {
            Resource concreteResource = resourceOrRef.resolve();
            return concreteResource != null && !concreteResource.hasAbstractCardType();
        }

        // in all other cases, spread
        return true;
    }

    /**
     * @return an initialized new resource reference
     */
    private static ResourceRef initNewResourceRef() {
        // implicitly setRefused(false)
        return new ResourceRef();
    }

    // *********************************************************************************************
    // when a card / card content is created,
    // initialize the references from parent's resources / resource references
    // *********************************************************************************************

    /**
     * Create a resource reference for each resource / resource reference of the parent that must be
     * spread
     *
     * @param cardToFill The new card that need references to the up stream resources
     */
    public static void spreadResourceFromUp(Card cardToFill) {
        CardContent parent = cardToFill.getParent();

        List<AbstractResource> parentResources = parent.getDirectAbstractResources();
        for (AbstractResource parentResource : parentResources) {
            if (mustSpreadReference(parentResource)) {
                ResourceRef reference = initNewReferenceFrom(parentResource);

                reference.setCard(cardToFill);
                cardToFill.getDirectAbstractResources().add(reference);

                spreadReferenceDown(cardToFill, reference);
            }
        }

        AbstractCardType type = cardToFill.getCardType();
        List<AbstractResource> typeResources = type.getDirectAbstractResources();
        for (AbstractResource typeResource : typeResources) {
            if (mustSpreadReference(typeResource)) {
                ResourceRef reference = initNewReferenceFrom(typeResource);

                reference.setCard(cardToFill);
                cardToFill.getDirectAbstractResources().add(reference);

                spreadReferenceDown(cardToFill, reference);
            }
        }
    }

    /**
     * Create a resource reference for each resource / resource reference of the parent that must be
     * spread
     *
     * @param cardContentToFill The new card content that need references to the up stream resources
     */
    public static void spreadResourceFromUp(CardContent cardContentToFill) {
        Card parent = cardContentToFill.getCard();

        List<AbstractResource> parentResources = parent.getDirectAbstractResources();
        for (AbstractResource parentResource : parentResources) {
            if (mustSpreadReference(parentResource)) {
                ResourceRef reference = initNewReferenceFrom(parentResource);

                reference.setCardContent(cardContentToFill);
                cardContentToFill.getDirectAbstractResources().add(reference);

                spreadReferenceDown(cardContentToFill, reference);
            }
        }
    }

    /**
     * Initialize a new reference to the target resource / resource reference
     *
     * @param target Base resource / resource reference
     *
     * @return The new resource reference
     */
    private static ResourceRef initNewReferenceFrom(AbstractResource target) {
        ResourceRef reference = new ResourceRef();

        reference.setCategory(target.getCategory());

        if (target instanceof ResourceRef) {
            Resource concreteResource = ((ResourceRef) target).resolve();
            if (concreteResource != null && concreteResource.isDeprecated()) {
                reference.setRefused(true);
            } else {
                reference.setRefused(((ResourceRef) target).isRefused());
            }
        }

        reference.setTarget(target);
        target.getDirectReferences().add(reference);

        return reference;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
