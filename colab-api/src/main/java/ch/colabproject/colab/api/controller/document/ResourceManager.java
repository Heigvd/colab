/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.controller.card.CardContentManager;
import ch.colabproject.colab.api.controller.card.CardManager;
import ch.colabproject.colab.api.controller.card.CardTypeManager;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.document.Resourceable;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.document.ResourceDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import java.util.stream.Collectors;
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
    // *********************************************************************************************

    /**
     * Resource / resource reference persistence handling
     */
    @Inject
    private ResourceDao resourceAndRefDao;

    /**
     * Card type specific logic management
     */
    @Inject
    private CardTypeManager cardTypeManager;

    /**
     * Card specific logic management
     */
    @Inject
    private CardManager cardManager;

    /**
     * Card content specific logic management
     */
    @Inject
    private CardContentManager cardContentManager;

    // *********************************************************************************************
    // find resource
    // *********************************************************************************************

    /**
     * Retrieve the resource (or reference). If not found, throw a {@link HttpErrorMessage}.
     *
     * @param resourceOrRefId the id of the resource or reference
     *
     * @return the resource or reference if found
     *
     * @throws HttpErrorMessage if the resource or reference was not found
     */
    public AbstractResource assertAndGetResourceOrRef(Long resourceOrRefId) {
        AbstractResource resourceOrRef = resourceAndRefDao.findResourceOrRef(resourceOrRefId);

        if (resourceOrRef == null) {
            logger.error("resource or reference #{} not found", resourceOrRefId);
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return resourceOrRef;
    }

    // *********************************************************************************************
    // find all resources for a card type / card / card content
    // *********************************************************************************************

    /**
     * Retrieve the abstract resources directly linked to an abstract card type and all the chain of
     * references to the concrete resource
     *
     * @param cardTypeOrRefId The id of the card type or reference
     *
     * @return For each direct abstract resource, the chain of abstract resources to the resource
     */
    public List<List<AbstractResource>> getExpandedResourcesForAbstractCardType(
        Long cardTypeOrRefId) {
        logger.debug("get expanded resources linked to abstract card type #{}", cardTypeOrRefId);

        AbstractCardType cardTypeOrRef = cardTypeManager.assertAndGetCardTypeOrRef(cardTypeOrRefId);

        List<AbstractResource> directResourcesAndRefs = cardTypeOrRef.getDirectAbstractResources();

        return expandCompleteChains(directResourcesAndRefs);
    }

    /**
     * Retrieve the abstract resources directly linked to a card and all the chain of references to
     * the concrete resource
     *
     * @param cardId The id of the card
     *
     * @return For each direct abstract resource, the chain of abstract resources to the resource
     */
    public List<List<AbstractResource>> getExpandedResourcesForCard(Long cardId) {
        logger.debug("get expanded resources linked to card #{}", cardId);

        Card card = cardManager.assertAndGetCard(cardId);

        List<AbstractResource> directResourcesAndRefs = card.getDirectAbstractResources();

        return expandCompleteChains(directResourcesAndRefs);
    }

    /**
     * Retrieve the abstract resources directly linked to a card content and all the chain of
     * references to the concrete resource
     *
     * @param cardContentId The id of the card content
     *
     * @return For each direct abstract resource, the chain of abstract resources to the resource
     */
    public List<List<AbstractResource>> getExpandedResourcesForCardContent(Long cardContentId) {
        logger.debug("get expanded resources linked to card content #{}", cardContentId);

        CardContent cardContent = cardContentManager.assertAndGetCardContent(cardContentId);

        List<AbstractResource> directResourcesAndRefs = cardContent.getDirectAbstractResources();

        return expandCompleteChains(directResourcesAndRefs);
    }

    /**
     * @param directResourcesAndRefs List of resources or references
     *
     * @return for each resource / resource reference, retrieve the all chain from it until a
     *         concrete resource
     */
    private List<List<AbstractResource>> expandCompleteChains(
        List<AbstractResource> directResourcesAndRefs) {
        return directResourcesAndRefs
            .stream()
            .map(resourceOrRef -> resourceOrRef.expand())
            .collect(Collectors.toList());
    }

    // *********************************************************************************************
    // life cycle
    // *********************************************************************************************

    /**
     * Complete and persist the given resource and create all the references needed.
     * <p>
     * Every child of the entity acquires a reference to that resource.<br>
     * And recursively the grand children acquires a reference to the reference of their parent.
     *
     * @param resource the resource to create
     *
     * @return the brand new resource
     */
    public Resource createResource(Resource resource) {
        logger.debug("create resource {}", resource);

        if (resource.getDocument() == null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        if (resource.getTeaser() == null) {
            initTeaser(resource);
        }

        // implicitly resource.setPublished(false);
        // implicitly resource.setRequestingForGlory(false);
        // implicitly resource.setDeprecated(false);

        Resourceable owner;
        if (resource.getAbstractCardTypeId() != null) {
            owner = cardTypeManager.assertAndGetCardTypeOrRef(resource.getAbstractCardTypeId());

        } else if (resource.getCardId() != null) {
            owner = cardManager.assertAndGetCard(resource.getCardId());

        } else if (resource.getCardContentId() != null) {
            owner = cardContentManager.assertAndGetCardContent(resource.getCardContentId());

        } else {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        resource.setOwner(owner);
        owner.getDirectAbstractResources().add(resource);

        ResourceReferenceSpreadingHelper.spreadNewResourceDown(resource);

        return resourceAndRefDao.persistResource(resource);
    }

    /**
     * Initialize the teaser of the given resource.
     *
     * @param resource the resource
     */
    private void initTeaser(Resource resource) {
        resource.setTeaser(Block.initNewDefaultBlock());
    }

    /**
     * Delete the given resource
     *
     * @param resourceId the id of the resource to delete
     */
    public void deleteResource(Long resourceId) {
        logger.debug("delete resource #{}", resourceId);

        AbstractResource resource = assertAndGetResourceOrRef(resourceId);

        if (!checkDeletionAcceptability(resource)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        deleteResourceAndRefs(resource);
    }

    /**
     * Ascertain that the resource can be deleted.
     *
     * @param resourceOrRef the resource (or reference) to check for deletion
     *
     * @return True iff it can be safely deleted
     */
    private boolean checkDeletionAcceptability(AbstractResource resourceOrRef) {
        // the only resources we delete manually are the concrete resources
        if (!(resourceOrRef instanceof Resource)) {
            return false;
        }

        return true;
    }

    /**
     * Delete each reference pointing at the given resourceOrRef and remove the resource from the
     * card type / card / card content.
     *
     * @param resourceOrRef The initial abstract resource to delete
     */
    private void deleteResourceAndRefs(AbstractResource resourceOrRef) {
        List<ResourceRef> references = resourceOrRef.getDirectReferences();
        if (references != null) {
            references.stream().forEach(ref -> deleteResourceAndRefs(ref));
        }

        if (resourceOrRef.getOwner() != null) {
            Resourceable owner = resourceOrRef.getOwner();
            owner.getDirectAbstractResources().remove(resourceOrRef);
        }

        resourceAndRefDao.deleteResourceOrRef(resourceOrRef.getId());

        // Note : the document is deleted by cascade
    }

    // *********************************************************************************************
    // retrieve the elements of a resource
    // *********************************************************************************************

    /**
     * Get all sticky note links whose source is the given resource / resource reference
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
    // dedicated to access control
    // *********************************************************************************************

    // *********************************************************************************************
    // integrity check
    // *********************************************************************************************

    /**
     * Check the integrity of the card type (or reference)
     *
     * @param resourceOrRef the resource (or reference) to check
     *
     * @return true iff the project is complete and safe
     */
    public boolean checkIntegrity(AbstractResource resourceOrRef) {
        if (resourceOrRef == null) {
            return false;
        }

        if (resourceOrRef instanceof Resource) {
            Resource resource = (Resource) resourceOrRef;
            if (resource.getDocument() == null) {
                return false;
            }
        }

        if (resourceOrRef instanceof ResourceRef) {
            ResourceRef reference = (ResourceRef) resourceOrRef;
            Resource finalTarget = reference.resolve();
            if (finalTarget == null) {
                return false;
            }
        }

        int nbCardType = resourceOrRef.getAbstractCardType() == null ? 0 : 1;
        int nbCard = resourceOrRef.getCard() == null ? 0 : 1;
        int nbCardContent = resourceOrRef.getCardContent() == null ? 0 : 1;
        if ((nbCardType + nbCard + nbCardContent) != 1) {
            return false;
        }

        return true;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
