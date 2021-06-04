/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.persistence.card.CardContentDao;
import ch.colabproject.colab.api.persistence.card.CardDao;
import ch.colabproject.colab.api.persistence.card.CardTypeDao;
//import ch.colabproject.colab.api.persistence.document.DocumentDao;
import ch.colabproject.colab.api.persistence.document.ResourceDao;
import ch.colabproject.colab.api.persistence.document.ResourceRefDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.ArrayList;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Resource and resource reference specific logic
 *
 * @author sandra
 */
// TODO refine the publish / deprecated / refused effect
// TODO requestingForGlory handling
@Stateless
@LocalBean
public class ResourceFacade {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ResourceFacade.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Resource persistence handling
     */
    @Inject
    private ResourceDao resourceDao;

    /**
     * Resource reference persistence handling
     */
    @Inject
    private ResourceRefDao resourceRefDao;

    /**
     * Card type persistence handling
     */
    @Inject
    private CardTypeDao cardTypeDao;

    /**
     * Card persistence
     */
    @Inject
    private CardDao cardDao;

    /**
     * Card content persistence handling
     */
    @Inject
    private CardContentDao cardContentDao;

    /**
     * To check access rights
     */
    @Inject
    private SecurityFacade securityFacade;

    // *********************************************************************************************
    // resource access stuff
    // *********************************************************************************************

    /**
     * Find every resource directly linked or linked by reference to the card type.
     * <p>
     * The resources must be active and available for the card type.
     *
     * @param cardTypeId the id of the card type
     *
     * @return all resources that match
     */
    public List<Resource> getAvailableActiveResourcesLinkedToCardType(Long cardTypeId) {
        logger.debug("Get available active resources linked to car type #{}", cardTypeId);

        CardType cardType = cardTypeDao.getCardType(cardTypeId);
        if (cardType == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return findAvailableAndActiveTargetResource(cardType.getDirectAbstractResources());
    }

    /**
     * Find every resource directly linked or linked by reference to the card.
     * <p>
     * The resources must be active and available for the card.
     *
     * @param cardId the id of the card
     *
     * @return all resources that match
     */
    public List<Resource> getAvailableActiveResourcesLinkedToCard(Long cardId) {
        logger.debug("Get available active resources linked to card #{}", cardId);

        Card card = cardDao.getCard(cardId);
        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return findAvailableAndActiveTargetResource(card.getDirectAbstractResources());
    }

    /**
     * Find every resource directly linked or linked by reference to the card content.
     * <p>
     * The resources must be active and available for the card content.
     *
     * @param cardId the id of the card content
     *
     * @return all resources that match
     */
    public List<Resource> getAvailableActiveResourcesLinkedToCardContent(Long cardContentId) {
        logger.debug("Get available active resources linked to card content #{}", cardContentId);

        CardContent cardContent = cardContentDao.getCardContent(cardContentId);
        if (cardContent == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return findAvailableAndActiveTargetResource(cardContent.getDirectAbstractResources());
    }

    /**
     * Find the resources at the end of the references chains.
     * <p>
     * Only the active and available resources are taken into account.
     *
     * @param baseAbstractResources The list of abstract resources to search from
     *
     * @return the resources that match
     */
    private List<Resource> findAvailableAndActiveTargetResource(
            List<AbstractResource> baseAbstractResources) {
        List<Resource> result = new ArrayList<>();

        for (AbstractResource abstractResource : baseAbstractResources) {
            Resource resource = getAvailableActiveResource(abstractResource);
            if (resource != null) {
                result.add(resource);
            }
        }

        return result;
    }

    /**
     * Recursive method to get the resource at the end of each references chain.
     * <p>
     * Only the active and available resources are taken into account.
     *
     * @param abstractResource An abstract resource
     *
     * @return the resource at the end of each references chain as long as it is available and
     *         active
     */
    private Resource getAvailableActiveResource(AbstractResource abstractResource) {
        if (abstractResource instanceof Resource) {
            return (Resource) abstractResource;
        } else if (abstractResource instanceof ResourceRef) {
            if (isResourceAvailableAndActive((ResourceRef) abstractResource)) {
                return getAvailableActiveResource(
                    ((ResourceRef) abstractResource).getTargetAbstractResource());
            }
        } else {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        return null;
    }

    /**
     * Filter to only take into account resources that are available and active
     * <p>
     * <ul>
     * <li>a resource must be published to be passed the sub cards</li>
     * <li>the reference must not be refused</li>
     * </ul>
     *
     * @param resourceRef the resource reference
     *
     * @return whether the resource can be taken into account or not
     */
    private boolean isResourceAvailableAndActive(ResourceRef resourceRef) {
        AbstractResource target = resourceRef.getTargetAbstractResource();
        if (resourceRef.hasCard() && target.hasCardContent()
                && !resourceRef.resolve().isPublished()) {
            return false;
        }

        return !resourceRef.isRefused();
    }

    // *********************************************************************************************
    // resource creation stuff
    // *********************************************************************************************

    /**
     * Create a new resource for the document linked to the card type
     * <p>
     * Every child of the card type (recursively) acquires a reference to that resource or, for the
     * grandchildren, to a reference to that resource
     *
     * @param document   the document the resource represents
     * @param cardTypeId the id of the card type the resource must be linked to
     *
     * @return the brand new resource
     */
    public Resource createResourceForCardType(Document document, Long cardTypeId) {
        logger.debug("create a resource for document {} and card type #{}", document,
            cardTypeId);

        if (document == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        // A document can be related at max to one resource
        if (document.hasResource()) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        CardType cardType = cardTypeDao.getCardType(cardTypeId);
        if (cardType == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        securityFacade.assertCanCreateResource(document, cardType);

        Resource resource = Resource.initNewResource();
        resource.setAbstractCardType(cardType);
        cardType.getDirectAbstractResources().add(resource);
        resource.setDocument(document);
        document.setResource(resource);

        resource = resourceDao.persistResource(resource);

        createResourceRefForChildren(cardType, resource);

        return resource;
    }

    /**
     * Create a new resource for the document linked to the card
     * <p>
     * Every child of the card (recursively) acquires a reference to that resource or, for the
     * grandchildren, to a reference to that resource
     *
     * @param document the document the resource represents
     * @param cardId   the id of the card the resource must be linked to
     *
     * @return the brand new resource
     */
    public Resource createResourceForCard(Document document, Long cardId) {
        logger.debug("create a resource for document {} and card #{}", document, cardId);

        if (document == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        // A document can be related at max to one resource
        if (document.hasResource()) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        Card card = cardDao.getCard(cardId);
        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        securityFacade.assertCanCreateResource(document, card);

        Resource resource = Resource.initNewResource();
        resource.setCard(card);
        card.getDirectAbstractResources().add(resource);
        resource.setDocument(document);
        document.setResource(resource);

        resource = resourceDao.persistResource(resource);

        createResourceRefForChildren(card, resource);

        return resource;
    }

    /**
     * Create a new resource for the document linked to the card content
     * <p>
     * Every child of the card content (recursively) acquires a reference to that resource or, for
     * the grandchildren, to a reference to that resource
     *
     * @param document      the document the resource represents
     * @param cardContentId the id of the card content the resource must be linked to
     *
     * @return the brand new resource
     */
    public Resource createResourceForCardContent(Document document, Long cardContentId) {
        logger.debug("create a resource for document {} and card content #{}", document,
            cardContentId);

        if (document == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        // A document can be related at max to one resource
        if (document.hasResource()) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        CardContent cardContent = cardContentDao.getCardContent(cardContentId);
        if (cardContent == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        securityFacade.assertCanCreateResource(document, cardContent);

        Resource resource = Resource.initNewResource();
        resource.setCardContent(cardContent);
        cardContent.getDirectAbstractResources().add(resource);
        resource.setDocument(document);
        document.setResource(resource);

        resource = resourceDao.persistResource(resource);

        createResourceRefForChildren(cardContent, resource);

        return resource;
    }

    /**
     * Each child of the card type acquires a reference to the resource.
     *
     * @param cardType the card type
     * @param resource the resource we are linking
     */
    private void createResourceRefForChildren(CardType cardType, AbstractResource resource) {
        for (Card card : cardType.getImplementingCards()) {
            ResourceRef resourceRef = ResourceRef.initNewResourceRef();
            resourceRef.setTargetAbstractResource(resource);
            resource.getSourceResourceRefs().add(resourceRef);
            resourceRef.setCard(card);
            card.getDirectAbstractResources().add(resourceRef);

            resourceRefDao.persistResourceRef(resourceRef);

            createResourceRefForChildren(card, resourceRef);
        }
    }

    /**
     * Each child of the card acquires a reference to the resource.
     *
     * @param card     the card
     * @param resource the resource we are linking
     */
    private void createResourceRefForChildren(Card card, AbstractResource resource) {
        for (CardContent cardContent : card.getContentVariants()) {
            ResourceRef resourceRef = ResourceRef.initNewResourceRef();
            resourceRef.setTargetAbstractResource(resource);
            resource.getSourceResourceRefs().add(resourceRef);
            resourceRef.setCardContent(cardContent);
            cardContent.getDirectAbstractResources().add(resourceRef);

            resourceRefDao.persistResourceRef(resourceRef);

            createResourceRefForChildren(cardContent, resourceRef);
        }
    }

    /**
     * Each child of the card content acquires a reference to the resource.
     *
     * @param cardContent the card content
     * @param resource    the resource we are linking
     */
    private void createResourceRefForChildren(CardContent cardContent, AbstractResource resource) {
        for (Card card : cardContent.getSubCards()) {
            ResourceRef resourceRef = ResourceRef.initNewResourceRef();
            resourceRef.setTargetAbstractResource(resource);
            resource.getSourceResourceRefs().add(resourceRef);
            resourceRef.setCard(card);
            card.getDirectAbstractResources().add(resourceRef);

            resourceRefDao.persistResourceRef(resourceRef);

            createResourceRefForChildren(card, resourceRef);
        }
    }

}
