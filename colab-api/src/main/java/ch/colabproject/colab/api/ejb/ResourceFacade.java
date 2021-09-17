/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.card.CardContentDao;
import ch.colabproject.colab.api.persistence.card.CardDao;
import ch.colabproject.colab.api.persistence.card.CardTypeDao;
import ch.colabproject.colab.api.persistence.document.AbstractResourceDao;
import ch.colabproject.colab.api.persistence.document.ResourceDao;
import ch.colabproject.colab.api.persistence.document.ResourceRefDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import com.google.common.base.Strings;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Resource and resource reference specific logic
 *
 * @author sandra
 */
// TODO refine the publish / deprecated / refused effect
// TODO requestingForGlory handling
// TODO !!!! deal with abstract card type
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
     * Resource / resource reference persistence handling
     */
    @Inject
    private AbstractResourceDao resourceOrRefDao;

    /**
     * Card type and card type reference persistence handling
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
     * @param abstractCardTypeId the id of the card type or card type reference
     *
     * @return all resources that match
     */
    public List<Resource> getAvailableActiveResourcesLinkedToAbstractCardType(
        Long abstractCardTypeId) {
        logger.debug("Get available active resources linked to abstract card type #{}",
            abstractCardTypeId);

        AbstractCardType cardTypeOrRef = cardTypeDao.getAbstractCardType(abstractCardTypeId);
        if (cardTypeOrRef == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return findAvailableAndActiveTargetResource(cardTypeOrRef.getDirectAbstractResources());
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
     * @param cardContentId the id of the card content
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
                    ((ResourceRef) abstractResource).getTarget());
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
        AbstractResource target = resourceRef.getTarget();
        if (resourceRef.hasCard() && target.hasCardContent()
            && !resourceRef.resolve().isPublished()) {
            return false;
        }

        return !resourceRef.isRefused();
    }

    /**
     * Get all abstract resources of a given card type.
     *
     * @param abstractCardTypeId the id of the card type
     *
     * @return all abstract resources directly linked to the card type
     */
    public List<AbstractResource> getDirectAbstractResourcesOfAbstractCardType(
        Long abstractCardTypeId) {
        logger.debug("get abstract resources directly linked to abstract card type #{}",
            abstractCardTypeId);
        AbstractCardType abstractCardType = cardTypeDao.getAbstractCardType(abstractCardTypeId);
        if (abstractCardType == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        return abstractCardType.getDirectAbstractResources();
    }

    /**
     * Get all abstract resources of a given card.
     *
     * @param cardId the id of the card
     *
     * @return all abstract resources directly linked to the card
     */
    public List<AbstractResource> getDirectAbstractResourcesOfCard(Long cardId) {
        logger.debug("get abstract resources directly linked to card #{}", cardId);
        Card card = cardDao.getCard(cardId);
        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        return card.getDirectAbstractResources();
    }

    /**
     * Get all abstract resources of a given card content.
     *
     * @param cardContentId the id of the card content
     *
     * @return all abstract resources directly linked to the card content
     */
    public List<AbstractResource> getDirectAbstractResourcesOfCardContent(Long cardContentId) {
        logger.debug("get abstract resources directly linked to card content #{}", cardContentId);
        CardContent cardContent = cardContentDao.getCardContent(cardContentId);
        if (cardContent == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        return cardContent.getDirectAbstractResources();
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

        AbstractCardType cardTypeOrRef = cardTypeDao.getAbstractCardType(cardTypeOrRefId);
        if (cardTypeOrRef == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        List<AbstractResource> directResourceOrRefs = cardTypeOrRef.getDirectAbstractResources();

        return expandCompleteChain(directResourceOrRefs);
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

        Card card = cardDao.getCard(cardId);
        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        List<AbstractResource> directResourceOrRefs = card.getDirectAbstractResources();

        return expandCompleteChain(directResourceOrRefs);
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

        CardContent cardContent = cardContentDao.getCardContent(cardContentId);
        if (cardContent == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        List<AbstractResource> directResourceOrRefs = cardContent.getDirectAbstractResources();

        return expandCompleteChain(directResourceOrRefs);
    }

    private List<List<AbstractResource>> expandCompleteChain(
        List<AbstractResource> directResourceOrRefs) {
        List<List<AbstractResource>> allResults = new ArrayList<>();
        directResourceOrRefs.forEach(resourceOrRef -> {
            allResults.add(resourceOrRef.expand());
        });

        return allResults;
    }

    // *********************************************************************************************
    // resource creation stuff
    // *********************************************************************************************

    /**
     * Create a new resource for the document linked to the card type (or card type reference).
     * <p>
     * Every child of the card type (recursively) acquires a reference to that resource or, for the
     * grandchildren, to a reference to that resource.
     *
     * @param document   the document the resource represents
     * @param cardTypeId the id of the card type the resource must be linked to
     * @param category   the category of the resource (for organization purpose)
     *
     * @return the brand new resource
     */
    public Resource createResourceForAbstractCardType(Document document, Long cardTypeId,
        String category) {
        logger.debug(
            "create a resource for document {} and an abstract card type #{} with category {}",
            document, cardTypeId, category);

        if (document == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        // A document can be related at max to one resource
        if (document.hasResource()) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        AbstractCardType abstractCardType = cardTypeDao.getAbstractCardType(cardTypeId);
        if (abstractCardType == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        securityFacade.assertCanCreateResource(document, abstractCardType);

        Resource resource = Resource.initNewResource();

        resource.setAbstractCardType(abstractCardType);
        abstractCardType.getDirectAbstractResources().add(resource);

        resource.setDocument(document);
        document.setResource(resource);

        if (!Strings.isNullOrEmpty(category)) {
            resource.setCategory(category);
        }

        resource = resourceDao.persistResource(resource);

        createResourceRefForChildren(abstractCardType, resource);

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
     * @param category the category of the resource (for organization purpose)
     *
     * @return the brand new resource
     */
    public Resource createResourceForCard(Document document, Long cardId, String category) {
        logger.debug("create a resource for document {} and card #{} with category {}",
            document, cardId, category);

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

        if (!Strings.isNullOrEmpty(category)) {
            resource.setCategory(category);
        }

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
     * @param category      the category of the resource (for organization purpose)
     *
     * @return the brand new resource
     */
    public Resource createResourceForCardContent(Document document, Long cardContentId,
        String category) {
        logger.debug("create a resource for document {} and card content #{} with category",
            document, cardContentId, category);

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

        if (!Strings.isNullOrEmpty(category)) {
            resource.setCategory(category);
        }

        resource = resourceDao.persistResource(resource);

        createResourceRefForChildren(cardContent, resource);

        return resource;
    }

    /**
     * Each child of the card type acquires a reference to the resource.
     *
     * @param cardTypeOrRef the card type or card type reference
     * @param resource      the resource we are linking
     */
    private void createResourceRefForChildren(AbstractCardType cardTypeOrRef,
        AbstractResource resource) {
        for (AbstractCardType cardTypeRef : cardTypeOrRef.getReferences()) {
            ResourceRef resourceRef = ResourceRef.initNewResourceRef();

            resourceRef.setTarget(resource);
            resource.getDirectReferences().add(resourceRef);

            resourceRef.setAbstractCardType(cardTypeRef);
            cardTypeRef.getDirectAbstractResources().add(resourceRef);

            resourceRefDao.persistResourceRef(resourceRef);

            createResourceRefForChildren(cardTypeRef, resourceRef);
        }

        for (Card card : cardTypeOrRef.getImplementingCards()) {
            ResourceRef cardResourceRef = ResourceRef.initNewResourceRef();

            cardResourceRef.setTarget(resource);
            resource.getDirectReferences().add(cardResourceRef);

            cardResourceRef.setCard(card);
            card.getDirectAbstractResources().add(cardResourceRef);

            resourceRefDao.persistResourceRef(cardResourceRef);

            for (CardContent cardContent : card.getContentVariants()) {
                ResourceRef cardContentResourceRef = ResourceRef.initNewResourceRef();

                cardContentResourceRef.setTarget(cardResourceRef);
                cardResourceRef.getDirectReferences().add(cardContentResourceRef);

                cardContentResourceRef.setCardContent(cardContent);
                cardContent.getDirectAbstractResources().add(cardContentResourceRef);

                resourceRefDao.persistResourceRef(cardContentResourceRef);
            }
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

            resourceRef.setTarget(resource);
            resource.getDirectReferences().add(resourceRef);

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

            resourceRef.setTarget(resource);
            resource.getDirectReferences().add(resourceRef);

            resourceRef.setCard(card);
            card.getDirectAbstractResources().add(resourceRef);

            resourceRefDao.persistResourceRef(resourceRef);

            createResourceRefForChildren(card, resourceRef);
        }
    }

    // *********************************************************************************************
    // deletion
    // *********************************************************************************************

    /**
     * Delete a resource
     *
     * @param resourceId the id of the resource to delete
     */
    public void deleteResource(Long resourceId) {
        logger.debug("delete resource #{}", resourceId);

        AbstractResource resource = resourceOrRefDao.findResourceOrRef(resourceId);
        if (resource == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
            // or just return. see what is best
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

        resourceOrRefDao.deleteResourceOrRef(resourceOrRef.getId());
    }

    // *********************************************************************************************
    // Category stuff
    // *********************************************************************************************

    /**
     * Set the category of the resource
     *
     * @param resourceOrRefId the id of the resource / resource reference
     * @param categoryName    the name of the category that apply to the resource / resource
     *                        reference
     */
    public void setCategory(Long resourceOrRefId, String categoryName) {
        logger.debug("set category {} to abstract resource #{}", categoryName, resourceOrRefId);

        if (StringUtils.isBlank(categoryName)) {
            removeCategory(resourceOrRefId);
        } else {
            AbstractResource resourceOrRef = resourceOrRefDao.findResourceOrRef(resourceOrRefId);
            if (resourceOrRef == null) {
                throw HttpErrorMessage.relatedObjectNotFoundError();
            }

            resourceOrRef.setCategory(categoryName);
        }
    }

    /**
     * Set the category of a list of resources
     *
     * @param resourceOrRefIds the id of the resources / resource references
     * @param categoryName     the name of the category that apply to the resource / resource
     *                         reference
     */
    public void setCategory(List<Long> resourceOrRefIds, String categoryName) {
        logger.debug("set category {} to abstract resources #{}", categoryName, resourceOrRefIds);

        if (StringUtils.isBlank(categoryName)) {
            removeCategory(resourceOrRefIds);
        } else {
            if (resourceOrRefIds == null) {
                throw HttpErrorMessage.relatedObjectNotFoundError();
            }

            resourceOrRefIds.stream().forEach(resOrRefId -> setCategory(resOrRefId, categoryName));
        }
    }

    /**
     * Remove the category of the resource / resource reference
     *
     * @param resourceOrRefId the id of the resource / resource reference
     */
    public void removeCategory(Long resourceOrRefId) {
        logger.debug("remove category of abstract resource #{}", resourceOrRefId);

        AbstractResource resourceOrRef = resourceOrRefDao.findResourceOrRef(resourceOrRefId);
        if (resourceOrRef == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        resourceOrRef.setCategory(null);
    }

    /**
     * Remove the category of a list of resources / resource references
     *
     * @param resourceOrRefIds the id of the resources / resource references
     */
    public void removeCategory(List<Long> resourceOrRefIds) {
        logger.debug("remove category to abstract resources #{}", resourceOrRefIds);

        if (resourceOrRefIds == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        resourceOrRefIds.stream().forEach(resOrRefId -> removeCategory(resOrRefId));
    }

    /**
     * Rename the category in a card type / card type reference
     *
     * @param cardTypeOrRefId the id of the card type / card type reference (scope of the renaming)
     * @param projectId       the id of the project concerned (scope of the renaming)
     * @param oldName         the old name of the category
     * @param newName         the new name of the category
     */
    public void renameCategoryInCardType(Long cardTypeOrRefId, Long projectId, String oldName,
        String newName) {
        logger.debug("rename category {} to {} in the abstract card type #{}", oldName, newName,
            cardTypeOrRefId);

        AbstractCardType cardTypeOrRef = cardTypeDao.getAbstractCardType(cardTypeOrRefId);
        if (cardTypeOrRef == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        Long effectiveProjectId = projectId;
        if (projectId == null) {
            effectiveProjectId = cardTypeOrRef.getProjectId();
        }

        renameCategory(cardTypeOrRef, effectiveProjectId, oldName, newName);
    }

    /**
     * Rename the category in a card
     *
     * @param cardId  the id of the card
     * @param oldName the old name of the category
     * @param newName the new name of the category
     */
    public void renameCategoryInCard(Long cardId, String oldName, String newName) {
        logger.debug("rename category {} to {} in the card #{}", oldName, newName, cardId);

        Card card = cardDao.getCard(cardId);
        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        renameCategory(card, oldName, newName);
    }

    /**
     * Rename the category in a card content
     *
     * @param cardContentId the id of the card content
     * @param oldName       the old name of the category
     * @param newName       the new name of the category
     */
    public void renameCategoryInCardContent(Long cardContentId, String oldName, String newName) {
        logger.debug("rename category {} to {} in the card content #{}", oldName, newName,
            cardContentId);

        CardContent cardContent = cardContentDao.getCardContent(cardContentId);
        if (cardContent == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        renameCategory(cardContent, oldName, newName);
    }

    // Note : the sub cards card type / card type reference are not changed. Should they ?

    /**
     * Rename the category in a card type / card type reference<br>
     * And do it also for the implementing cards as long as they are of the same project
     *
     * @param cardTypeOrRef the card type / card type reference (scope of the renaming)
     * @param projectId     the id of the project concerned (scope of the renaming)
     * @param oldName       the old name of the category
     * @param newName       the new name of the category
     */
    private void renameCategory(AbstractCardType cardTypeOrRef, Long projectId, String oldName,
        String newName) {
        cardTypeOrRef.getDirectAbstractResources().stream()
            .forEach(resourceOrRef -> renameCategoryIfMatch(resourceOrRef, oldName, newName));

        cardTypeOrRef.getImplementingCards().stream()
            .filter(card -> Objects.equals(projectId, card.getProject().getId()))
            .forEach(card -> renameCategory(card, oldName, newName));

        cardTypeOrRef.getReferences().stream()
            .forEach(cardRef -> renameCategory(cardRef, projectId, oldName, newName));
    }

    /**
     * Rename the category in a card<br>
     * And do it also for each card's variants
     *
     * @param card    the card (scope of the renaming)
     * @param oldName the old name of the category
     * @param newName the new name of the category
     */
    private void renameCategory(Card card, String oldName, String newName) {
        card.getDirectAbstractResources().stream()
            .forEach(resourceOrRef -> renameCategoryIfMatch(resourceOrRef, oldName, newName));

        card.getContentVariants().stream()
            .forEach(cardContent -> renameCategory(cardContent, oldName, newName));
    }

    /**
     * Rename the category in a card content<br>
     * And do it also for each sub cards
     *
     * @param cardContent the card content (scope of the renaming)
     * @param oldName     the old name of the category
     * @param newName     the new name of the category
     */
    private void renameCategory(CardContent cardContent, String oldName, String newName) {
        cardContent.getDirectAbstractResources().stream()
            .forEach(resourceOrRef -> renameCategoryIfMatch(resourceOrRef, oldName, newName));

        cardContent.getSubCards().stream().forEach(card -> renameCategory(card, oldName, newName));
    }

    // Note : a "CardPropagator" could be easily done with the methods here. See if useful

    /**
     * Replace the category of the resource if it matches the oldName
     *
     * @param resourceOrRef the resource or resource reference
     * @param oldName       the old name of the category
     * @param newName       the new name of the category
     */
    private void renameCategoryIfMatch(AbstractResource resourceOrRef, String oldName,
        String newName) {
        if (Objects.equals(resourceOrRef.getCategory(), oldName)) {
            if (StringUtils.isBlank(newName)) {
                resourceOrRef.setCategory(null);
            } else {
                resourceOrRef.setCategory(StringUtils.trim(newName));
            }
        }
    }

    // *********************************************************************************************
    // Links stuff
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
        AbstractResource resource = resourceOrRefDao.findResourceOrRef(resourceOrRefId);
        if (resource == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        return resource.getStickyNoteLinksAsSrc();
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
