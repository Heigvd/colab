/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.document;

import ch.colabproject.colab.api.controller.document.RelatedPosition;
import ch.colabproject.colab.api.controller.document.ResourceCategoryHelper;
import ch.colabproject.colab.api.controller.document.ResourceManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.DuplicationParam;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.jpa.document.ResourceDao;
import ch.colabproject.colab.api.rest.document.bean.ResourceCreationData;
import ch.colabproject.colab.api.rest.document.bean.ResourceExternalReference;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import java.util.List;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * REST resource controller
 *
 * @author sandra
 */
@Path("resources")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class ResourceRestEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ResourceRestEndpoint.class);

    // *********************************************************************************************
    // injections

    /**
     * The resource / resource reference persistence manager
     */
    @Inject
    private ResourceDao resourceDao;

    /**
     * The resource and resource reference related logic
     */
    @Inject
    private ResourceManager resourceManager;

    /**
     * Category specific logic handling
     */
    @Inject
    private ResourceCategoryHelper resourceCategoryHelper;

    // *********************************************************************************************
    // read
    // *********************************************************************************************

    /**
     * Get the resource or resource reference identified by the given id
     *
     * @param id the id of the resource or resource reference to fetch
     *
     * @return the resource or resource reference or null
     */
    @GET
    @Path("{id: [0-9]+}")
    public AbstractResource getAbstractResource(@PathParam("id") Long id) {
        logger.debug("get abstract resource #{}", id);
        return resourceDao.findResourceOrRef(id);
    }

    /**
     * Get the resources linked to the card type or reference. With a list of resource references to
     * retrieve each resource.
     *
     * @param cardTypeOrRefId the id of the abstract card type for which we look for the linked
     *                        resources
     *
     * @return The targeted resource and a list of the references to get it
     */
    @GET
    @Path("fromCardType/{cardTypeOrRefId: [0-9]+}")
    public List<List<AbstractResource>> getResourceChainForAbstractCardType(
        @PathParam("cardTypeOrRefId") Long cardTypeOrRefId) {
        logger.debug("get resource chain for card content #{}", cardTypeOrRefId);
        return resourceManager.getExpandedResourcesForAbstractCardType(cardTypeOrRefId);
    }

    /**
     * Get the resources linked to the card. With a list of resource references to retrieve each
     * resource.
     *
     * @param cardId the id of the card for which we look for the linked resources
     *
     * @return The targeted resource and a list of the references to get it
     */
    @GET
    @Path("fromCard/{cardId: [0-9]+}")
    public List<List<AbstractResource>> getResourceChainForCard(
        @PathParam("cardId") Long cardId) {
        logger.debug("get resource chain for card content #{}", cardId);
        return resourceManager.getExpandedResourcesForCard(cardId);
    }

    /**
     * Get the resources linked to the card content. With a list of resource references to retrieve
     * each resource.
     *
     * @param cardContentId the id of the card content for which we look for the linked resources
     *
     * @return The targeted resources and a list of the references to get them
     */
    @GET
    @Path("fromCardContent/{cardContentId: [0-9]+}")
    public List<List<AbstractResource>> getResourceChainForCardContent(
        @PathParam("cardContentId") Long cardContentId) {
        logger.debug("get resource chain for card content #{}", cardContentId);
        return resourceManager.getExpandedResourcesForCardContent(cardContentId);
    }

    /**
     * Get the resources directly linked to the given project.
     * <p>
     * Does not fetch all chain references.
     *
     * @param projectId the id of the project ‡
     *
     * @return resources directly linked to the given project
     */
    @GET
    @Path("directOfProject/{projectId: [0-9]+}")
    public List<AbstractResource> getDirectAbstractResourcesOfProject(
        @PathParam("projectId") Long projectId) {
        logger.debug("get all resources of the project #{}", projectId);
        return resourceManager.getDirectAbstractResourcesOfProject(projectId);
    }

    /**
     * Get the list of project which reference the given resource, excluding the project which owns
     * the resource.
     *
     * @param abstractResourceId if of the targeted resource
     *
     * @return list of externalReference
     */
    @GET
    @Path("externalReference/{abstractResourceId: [0-9]+}")
    public List<ResourceExternalReference> getResourceExternalReferences(
        @PathParam("abstractResourceId") Long abstractResourceId) {
        return resourceManager.getResourceExternalReferences(abstractResourceId);
    }

    // *********************************************************************************************
    // update
    // *********************************************************************************************

    /**
     * Save changes to database. Only fields which are editable by users will be impacted.
     *
     * @param resource the resource to update
     *
     * @throws ColabMergeException if the merge is impossible
     */
    @PUT
    public void updateResource(Resource resource) throws ColabMergeException {
        logger.debug("update resource {}", resource);
        resourceDao.updateResourceOrRef(resource);
    }

    /**
     * Save changes to database. Only fields which are editable by users will be impacted.
     *
     * @param resourceRef the resource reference to update
     *
     * @throws ColabMergeException if the merge is impossible
     */
    @PUT
    @Path("ref")
    public void updateResourceRef(ResourceRef resourceRef) throws ColabMergeException {
        logger.debug("update resource reference {}", resourceRef);
        resourceDao.updateResourceOrRef(resourceRef);
    }

    /**
     * Duplicate the given resource
     *
     * @param resourceId the id of the resource we want to duplicate
     * @param parentType the new owner
     * @param parentId   if of the new owner
     *
     * @return the id of the duplicated resource
     */
    @PUT
    @Path("copyResource1/{resourceId: [0-9]+}/to/{parentType: (Card|CardContent|CardType)}/{parentId: [0-9]+}")
    public Long damr1(
        @PathParam("resourceId") Long resourceId,
        @PathParam("parentType") String parentType,
        @PathParam("parentId") Long parentId) {
        logger.debug("duplicate the resource #{} to {}#{}", resourceId, parentType,
            parentId);

        DuplicationParam effectiveParams = DuplicationParam.buildDefaultForCopyOfResource();

        Resource newResource = resourceManager.copyResourceTo(resourceId, effectiveParams,
            parentType, parentId, false);

        return newResource.getId();
    }

    // *********************************************************************************************
    // change state of a resource
    // *********************************************************************************************

    /**
     * Make a resource (or reference) not active = not visible anymore
     *
     * @param resourceOrRefId the resource (or reference) to discard
     *
     * @throws ColabMergeException if the merge is impossible
     */
    @PUT
    @Path("discard")
    public void discardResourceOrRef(Long resourceOrRefId)
        throws ColabMergeException {
        logger.debug("discard resource or ref #{}", resourceOrRefId);
        resourceManager.discardResourceOrRef(resourceOrRefId);
    }

    /**
     * Make a resource (or reference) active again
     *
     * @param resourceOrRefId the resource (or reference) to restore
     *
     * @throws ColabMergeException if the merge is impossible
     */
    @PUT
    @Path("restore")
    public void restoreResourceOrRef(Long resourceOrRefId)
        throws ColabMergeException {
        logger.debug("restore resource or ref #{} ", resourceOrRefId);
        resourceManager.restoreResourceOrRef(resourceOrRefId);
    }

    /**
     * Publish a resource.
     *
     * @param resourceId the id of the resource
     */
    @PUT
    @Path("publish")
    public void publishResource(Long resourceId) {
        logger.debug("Publish resource #{}", resourceId);
        resourceManager.changeResourcePublication(resourceId, true);
    }

    /**
     * Un-publish a resource.
     *
     * @param resourceId the id of the resource
     */
    @PUT
    @Path("unpublish")
    public void unpublishResource(Long resourceId) {
        logger.debug("Unpublish resource #{}", resourceId);
        resourceManager.changeResourcePublication(resourceId, false);
    }

    // *********************************************************************************************
    // move a resource / document
    // *********************************************************************************************

    /**
     * Move a resource to a new resourceable.
     *
     * @param resourceId id of the resource to move
     * @param parentType the new owner
     * @param parentId   if of the new owner
     * @param published  new publication status
     */
    @PUT
    @Path("move/{resourceId: [0-9]+}/to/{parentType: (Card|CardContent|CardType)}/{parentId: [0-9]+}/{published}")
    public void moveResource(
        @PathParam("resourceId") Long resourceId,
        @PathParam("parentType") String parentType,
        @PathParam("parentId") Long parentId,
        @PathParam("published") Boolean published) {
        logger.debug("Move resource #{} to {}#{}; published={}",
            resourceId, parentType, parentId, published);

        resourceManager.moveResource(resourceId, parentType, parentId, published);
    }

    // *********************************************************************************************
    // create a resource / document
    // *********************************************************************************************

    /**
     * Create a resource
     *
     * @param resourceCreationData Everything needed to create a resource
     *
     * @return the brand new resource id
     */
    @POST
    @Path("create")
    public Long createResource(ResourceCreationData resourceCreationData) {
        logger.debug("create resource {}", resourceCreationData);

        Resource resource = new Resource();
        resource.setTitle(resourceCreationData.getTitle());
        resource.setTeaser(resourceCreationData.getTeaser());
        if (resource.getTeaser() != null) {
            resource.getTeaser().setTeasingResource(resource);
        }
        resource.setCategory(resourceCreationData.getCategory());
        resource.setAbstractCardTypeId(resourceCreationData.getAbstractCardTypeId());
        resource.setCardId(resourceCreationData.getCardId());
        resource.setCardContentId(resourceCreationData.getCardContentId());
        resource.setPublished(resourceCreationData.isPublished());

        Resource newResource = resourceManager.createResource(resource);

        if (CollectionUtils.isNotEmpty(resourceCreationData.getDocuments())) {
            for (Document document : resourceCreationData.getDocuments()) {
                resourceManager.addDocument(newResource.getId(), document);
            }
        }

        return newResource.getId();
    }

    /**
     * Add the document at the beginning of the resource.
     *
     * @param resourceId the id of the resource
     * @param document   the document to use in the resource. It must be a new document
     *
     * @return the document newly created
     */
    @POST
    @Path("{id: [0-9]+}/addDocumentAtBeginning")
    public Document addDocumentAtBeginning(@PathParam("id") Long resourceId, Document document) {
        logger.debug("add the document {} at the beginning of the resource #{}", document,
            resourceId);
        return resourceManager.addDocument(resourceId, document,
            RelatedPosition.AT_BEGINNING, null);
    }

    /**
     * Add the document at the end of the resource.
     *
     * @param resourceId the id of the resource
     * @param document   the document to use in the resource. It must be a new document
     *
     * @return the document newly created
     */
    @POST
    @Path("{id: [0-9]+}/addDocumentAtEnd")
    public Document addDocumentAtEnd(@PathParam("id") Long resourceId, Document document) {
        logger.debug("add the document {} at the end of the resource #{}", document, resourceId);
        return resourceManager.addDocument(resourceId, document,
            RelatedPosition.AT_END, null);
    }

    /**
     * Add the document to the resource just before the given document.
     *
     * @param resourceId     the id of the resource
     * @param neighbourDocId the id of the document which will be just after the new document
     * @param document       the document to use in the resource. It must be a new document
     *
     * @return the document newly created
     */
    @POST
    @Path("{id: [0-9]+}/addDocumentBefore/{neighbourDocId: [0-9]+}")
    public Document addDocumentBefore(@PathParam("id") Long resourceId,
        @PathParam("neighbourDocId") Long neighbourDocId, Document document) {
        logger.debug("add the document {} before #{} in the resource #{}", document,
            neighbourDocId, resourceId);
        return resourceManager.addDocument(resourceId, document, RelatedPosition.BEFORE,
            neighbourDocId);
    }

    /**
     * Add the document to the resource just after the given document.
     *
     * @param resourceId     the id of the resource
     * @param neighbourDocId the id of the document which will be just before the new document
     * @param document       the document to use in the resource. It must be a new document
     *
     * @return the document newly created
     */
    @POST
    @Path("{id: [0-9]+}/addDocumentAfter/{neighbourDocId: [0-9]+}")
    public Document addDocumentAfter(@PathParam("id") Long resourceId,
        @PathParam("neighbourDocId") Long neighbourDocId, Document document) {
        logger.debug("add the document {} after #{} in the resource #{}", document,
            neighbourDocId, resourceId);
        return resourceManager.addDocument(resourceId, document, RelatedPosition.AFTER,
            neighbourDocId);
    }

    /**
     * Remove the document of the resource.
     *
     * @param resourceId the id of the resource
     * @param documentId the id of the document to remove from the resource
     */
    @POST
    @Path("{id: [0-9]+}/removeDocument")
    public void removeDocument(@PathParam("id") Long resourceId, Long documentId) {
        logger.debug("add the document {} for the resource #{}", documentId, resourceId);

        resourceManager.removeDocument(resourceId, documentId);
    }

    // *********************************************************************************************
    // deletion
    // *********************************************************************************************

    /**
     * Permanently delete a resource
     *
     * @param id the id of the resource to delete
     */
    @DELETE
    @Path("{id: [0-9]+}")
    public void deleteResource(@PathParam("id") Long id) {
        logger.debug("delete resource #{}", id);
        resourceManager.deleteResource(id);
    }

    // *********************************************************************************************
    // category
    // *********************************************************************************************

    /**
     * Set the category of the resource
     *
     * @param resourceOrRefId the id of the resource / resource reference
     * @param categoryName    the name of the category that apply to the resource / resource
     *                        reference
     */
    @PUT
    @Path("changeCategory/{resourceOrRefId: [0-9]+}/{category : .*}")
    public void changeCategory(@PathParam("resourceOrRefId") Long resourceOrRefId,
        @PathParam("category") String categoryName) {
        logger.debug("add resource/ref #{} to category {}", resourceOrRefId, categoryName);
        resourceCategoryHelper.changeCategory(resourceOrRefId, categoryName);
    }

    /**
     * Set the category of a list of resources
     *
     * @param resourceOrRefIds the id of the resources / resource references
     * @param categoryName     the name of the category that apply to the resource / resource
     *                         reference
     */
    @PUT
    @Path("changeCategory/list/{newName : .*}")
    public void changeCategoryForList(@PathParam("newName") String categoryName,
        List<Long> resourceOrRefIds) {
        logger.debug("add resource/ref #{} to category {}", resourceOrRefIds, categoryName);
        resourceCategoryHelper.changeCategory(resourceOrRefIds, categoryName);
    }

    /**
     * Remove the category of the resource / resource reference
     *
     * @param resourceOrRefId the id of the resource / resource reference
     */
    @PUT
    @Path("removeCategory/{resourceOrRefId: [0-9]+}")
    public void removeCategory(@PathParam("resourceOrRefId") Long resourceOrRefId) {
        logger.debug("remove category from resource/ref #{}", resourceOrRefId);
        resourceCategoryHelper.changeCategory(resourceOrRefId, null);
    }

    /**
     * Remove the category of a list of resources / resource references
     *
     * @param resourceOrRefIds the id of the resources / resource references
     */
    @PUT
    @Path("removeCategory/list")
    public void removeCategoryForList(List<Long> resourceOrRefIds) {
        logger.debug("remove category from resource/ref #{}", resourceOrRefIds);
        resourceCategoryHelper.changeCategory(resourceOrRefIds, null);
    }

    /**
     * Rename the category in a card type / card type reference
     *
     * @param cardTypeOrRefId the id of the card type / card type reference (scope of the renaming)
     * @param oldName         the old name of the category
     * @param newName         the new name of the category
     */
    @PUT
    @Path("renameCategory/cardType/{cardTypeId: [0-9]+}/{oldName : .*}/{newName : .*}")
    public void renameCategoryForCardType(
        @PathParam("cardTypeId") Long cardTypeOrRefId, @PathParam("oldName") String oldName,
        @PathParam("newName") String newName) {
        logger.debug("rename category {} to {} for card type #{}", oldName,
            newName, cardTypeOrRefId);
        resourceCategoryHelper.renameCategoryInCardType(cardTypeOrRefId, oldName, newName);
    }

    /**
     * Rename the category in a card
     *
     * @param cardId  the id of the card
     * @param oldName the old name of the category
     * @param newName the new name of the category
     */
    @PUT
    @Path("renameCategory/card/{cardId: [0-9]+}/{oldName : .*}/{newName : .*}")
    public void renameCategoryForCard(@PathParam("cardId") Long cardId,
        @PathParam("oldName") String oldName, @PathParam("newName") String newName) {
        logger.debug("rename category {} to {} for card #{}", oldName, newName, cardId);
        resourceCategoryHelper.renameCategoryInCard(cardId, oldName, newName);
    }

    /**
     * Rename the category in a card content
     *
     * @param cardContentId the id of the card content
     * @param oldName       the old name of the category
     * @param newName       the new name of the category
     */
    @PUT
    @Path("renameCategory/cardContent/{cardContentId: [0-9]+}/{oldName : .*}/{newName : .*}")
    public void renameCategoryForCardContent(@PathParam("cardContentId") Long cardContentId,
        @PathParam("oldName") String oldName, @PathParam("newName") String newName) {
        logger.debug("rename category {} to {} for card content #{}", oldName, newName,
            cardContentId);
        resourceCategoryHelper.renameCategoryInCardContent(cardContentId, oldName, newName);
    }

    // *********************************************************************************************
    // links
    // *********************************************************************************************

    /**
     * Get the documents of the resource
     *
     * @param resourceId the id of the resource
     *
     * @return the documents linked to the resource
     */
    @GET
    @Path("{id: [0-9]+}/Documents")
    public List<Document> getDocumentsOfResource(@PathParam("id") Long resourceId) {
        logger.debug("Get the documents of the resource #{}", resourceId);
        return resourceManager.getDocumentsOfResource(resourceId);
    }

    /**
     * Get all sticky note links where the resource / resource reference is the source
     *
     * @param resourceOrRefId the id of the resource / resource reference
     *
     * @return list of links
     */
    @GET
    @Path("{id: [0-9]+}/StickyNoteLinks")
    public List<StickyNoteLink> getStickyNoteLinksAsSrc(@PathParam("id") Long resourceOrRefId) {
        logger.debug("Get sticky note links to abstract resource #{} as source", resourceOrRefId);
        return resourceManager.getStickyNoteLinkAsSrc(resourceOrRefId);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
