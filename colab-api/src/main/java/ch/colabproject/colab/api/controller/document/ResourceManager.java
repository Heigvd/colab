/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.ejb.CardFacade;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.document.ResourceAndRefDao;
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
public class ResourceManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ResourceManager.class);

    // *********************************************************************************************
    // injections

    /**
     * Resource / resource reference persistence handling
     */
    @Inject
    private ResourceAndRefDao resourceAndRefDao;

    /**
     * Card type, card and card content specific logic
     */
    @Inject
    private CardFacade cardFacade;

    // *********************************************************************************************
    // resource access
    // *********************************************************************************************

    /**
     * @param resourceOrRefId The identifier of the searched resource or reference
     *
     * @return The resource or reference corresponding to the id
     */
    public AbstractResource assertAndGetResourceOrRef(Long resourceOrRefId) {
        AbstractResource resourceOrRef = resourceAndRefDao.findResourceOrRef(resourceOrRefId);

        if (resourceOrRef == null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        return resourceOrRef;
    }

    /**
     * Retrieve the abstract resources directly linked to an abstract card type and all the chain of
     * references to the concrete resource
     *
     * @param cardTypeOrRefId The id of the card type or reference
     *
     * @return For each abstract resource, the chain of abstract resources to the resource
     */
    public List<List<AbstractResource>> getResourceChainForAbstractCardType(Long cardTypeOrRefId) {
        logger.debug("get resource chain linked to abstract card type #{}", cardTypeOrRefId);

        AbstractCardType cardTypeOrRef = cardFacade.assertAndGetAbstractCardType(cardTypeOrRefId);

        List<AbstractResource> directResourceOrRefs = cardTypeOrRef.getDirectAbstractResources();

        return expandCompleteChains(directResourceOrRefs);
    }

    /**
     * Retrieve the abstract resources directly linked to a card and all the chain of references to
     * the concrete resource
     *
     * @param cardId The id of the card
     *
     * @return For each abstract resource, the chain of abstract resources until the resource
     */
    public List<List<AbstractResource>> getResourceChainForCard(Long cardId) {
        logger.debug("get resource chain linked to card #{}", cardId);

        Card card = cardFacade.assertAndGetCard(cardId);

        List<AbstractResource> directResourceOrRefs = card.getDirectAbstractResources();

        return expandCompleteChains(directResourceOrRefs);
    }

    /**
     * Retrieve the abstract resources directly linked to a card content and all the chain of
     * references to the concrete resource
     *
     * @param cardContentId The id of the card content
     *
     * @return For each abstract resource, the chain of abstract resources until the resource
     */
    public List<List<AbstractResource>> getResourceChainForCardContent(Long cardContentId) {
        logger.debug("get resource chain linked to card content #{}", cardContentId);

        CardContent cardContent = cardFacade.assertAndGetCardContent(cardContentId);

        List<AbstractResource> directResourceOrRefs = cardContent.getDirectAbstractResources();

        return expandCompleteChains(directResourceOrRefs);
    }

    /**
     * @param directResourceOrRefs List of resources or references
     *
     * @return for each resource / resource reference, retrieve the all chain from it until a
     *         concrete resource
     */
    private List<List<AbstractResource>> expandCompleteChains(
        List<AbstractResource> directResourceOrRefs) {
        List<List<AbstractResource>> allResults = new ArrayList<>();
        directResourceOrRefs.forEach(resourceOrRef -> {
            allResults.add(resourceOrRef.expand());
        });

        return allResults;
    }

    // *********************************************************************************************
    // resource creation
    // *********************************************************************************************

    /**
     * Create a new resource.
     * <p>
     * Every child of the card type acquires a reference to that resource.<br>
     * And recursively the grandchildren acquires a reference to the reference of their parent.
     *
     * @param resource the resource to create
     *
     * @return the brand new resource
     */
    public Resource createResource(Resource resource) {
        logger.debug("create a resource {}", resource);

        if (resource.getDocument() == null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        if (resource.getTeaser() == null) {
            initTeaser(resource);
        }

        if (resource.getAbstractCardTypeId() != null) {
            return createResourceForAbstractCardType(resource);
        }

        if (resource.getCardId() != null) {
            return createResourceForCard(resource);
        }

        if (resource.getCardContentId() != null) {
            return createResourceForCardContent(resource);
        }

        throw HttpErrorMessage.dataIntegrityFailure();
    }

    private void initTeaser(Resource resource) {
        resource.setTeaser(Block.initNewDefaultBlock());
    }

    /**
     * Create a new resource linked to a card type (or a card type reference).
     * <p>
     * Every child of the card type acquires a reference to that resource.<br>
     * And recursively the grandchildren acquires a reference to the reference of their parent.
     *
     * @param resource the resource to create
     *
     * @return the brand new resource
     */
    private Resource createResourceForAbstractCardType(Resource resource) {
        logger.debug("create the resource {} for abstract card type", resource);

        AbstractCardType abstractCardType = cardFacade
            .assertAndGetAbstractCardType(resource.getAbstractCardTypeId());

        resource.setAbstractCardType(abstractCardType);
        abstractCardType.getDirectAbstractResources().add(resource);

        ResourceReferenceSpreadingHelper.spreadReferenceDown(abstractCardType, resource);

        resourceAndRefDao.persistResource(resource);

        return resource;
    }

    /**
     * Create a new resource linked to a card
     * <p>
     * Every direct child of the card acquires a reference to that resource.<br>
     * And recursively the grandchildren acquires a reference to the reference of their parent.
     *
     * @param resource The resource to create
     *
     * @return the brand new resource
     */
    private Resource createResourceForCard(Resource resource) {
        logger.debug("create the resource {} for card", resource);

        Card card = cardFacade.assertAndGetCard(resource.getCardId());

        resource.setCard(card);
        card.getDirectAbstractResources().add(resource);

        ResourceReferenceSpreadingHelper.spreadReferenceDown(card, resource);

        resourceAndRefDao.persistResource(resource);

        return resource;
    }

    /**
     * Create a new resource for the document linked to the card content
     * <p>
     * Every child of the card content acquires a reference to that resource.<br>
     * And recursively the grandchildren acquires a reference to the reference of their parent.
     *
     * @param resource the resource to create
     *
     * @return the brand new resource
     */
    private Resource createResourceForCardContent(Resource resource) {
        logger.debug("create the resource {} for card content", resource);

        CardContent cardContent = cardFacade.assertAndGetCardContent(resource.getCardContentId());

        resource.setCardContent(cardContent);
        cardContent.getDirectAbstractResources().add(resource);

        ResourceReferenceSpreadingHelper.spreadReferenceDown(cardContent, resource);

        resourceAndRefDao.persistResource(resource);

        return resource;
    }

    // *********************************************************************************************
    // resource deletion
    // *********************************************************************************************

    /**
     * Delete a resource
     *
     * @param resourceId the id of the resource to delete
     */
    public void deleteResource(Long resourceId) {
        logger.debug("delete resource #{}", resourceId);

        AbstractResource resource = resourceAndRefDao.findResourceOrRef(resourceId);
        if (resource == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
            // FIXME or just return. see what is best
        }

        if (!(resource instanceof Resource)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        deleteResourceAndRefs(resource);

        // Note : the document is deleted by cascade
    }

    /**
     * Delete each reference pointing at the given resourceOrRef
     *
     * @param resourceOrRef The initial abstract resource to delete
     */
    private void deleteResourceAndRefs(AbstractResource resourceOrRef) {
        List<ResourceRef> references = resourceOrRef.getDirectReferences();
        if (references != null) {
            references.stream().forEach(ref -> deleteResourceAndRefs(ref));
        }

        if (resourceOrRef.hasAbstractCardType()) {
            AbstractCardType cardTypeOrRef = resourceOrRef.getAbstractCardType();
            cardTypeOrRef.getDirectAbstractResources().remove(resourceOrRef);
        }

        if (resourceOrRef.hasCard()) {
            Card card = resourceOrRef.getCard();
            card.getDirectAbstractResources().remove(resourceOrRef);
        }

        if (resourceOrRef.hasCardContent()) {
            CardContent cardContent = resourceOrRef.getCardContent();
            cardContent.getDirectAbstractResources().remove(resourceOrRef);
        }

        resourceAndRefDao.deleteResourceOrRef(resourceOrRef.getId());
    }

    // *********************************************************************************************
    // Links
    // *********************************************************************************************

    /**
     * Get all sticky note links of which the given resource / resource reference is the source
     *
     * @param resourceOrRefId the id of the resource / resource reference
     *
     * @return all sticky note links linked to the resource / resource reference
     */
    public List<StickyNoteLink> getStickyNoteLinkAsSrc(Long resourceOrRefId) {
        logger.debug("get sticky note links where the abstract resource #{} is the source",
            resourceOrRefId);

        AbstractResource resource = assertAndGetResourceOrRef(resourceOrRefId);

        return resource.getStickyNoteLinksAsSrc();
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
