/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.document;

import ch.colabproject.colab.api.controller.document.ResourceCategoryHelper;
import ch.colabproject.colab.api.controller.document.ResourceManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.jpa.document.ResourceAndRefDao;
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
    private ResourceAndRefDao resourceAndRefDao;

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
    @Path("{id}")
    public AbstractResource getAbstractResource(@PathParam("id") Long id) {
        logger.debug("get abstract resource #{}", id);
        return resourceAndRefDao.findResourceOrRef(id);
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
    @Path("fromCardType/{cardTypeOrRefId}")
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
    @Path("fromCard/{cardId}")
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
    @Path("fromCardContent/{cardContentId}")
    public List<List<AbstractResource>> getResourceChainForCardContent(
        @PathParam("cardContentId") Long cardContentId) {
        logger.debug("get resource chain for card content #{}", cardContentId);
        return resourceManager.getExpandedResourcesForCardContent(cardContentId);
    }

    // *********************************************************************************************
    // update
    // *********************************************************************************************

    /**
     * Save changes to database
     *
     * @param resource the resource to update
     *
     * @throws ColabMergeException if the merge is impossible
     */
    @PUT
    public void updateResource(Resource resource) throws ColabMergeException {
        logger.debug("update resource {}", resource);
        resourceAndRefDao.updateResource(resource);
    }

    // TODO see if updateResourceOrRef(AbstractResource resource)

    /**
     * Save changes to database
     *
     * @param resourceRef the resource reference to update
     *
     * @throws ColabMergeException if the merge is impossible
     */
    @PUT
    @Path("ref")
    public void updateResourceRef(ResourceRef resourceRef) throws ColabMergeException {
        logger.debug("update resource reference {}", resourceRef);
        resourceAndRefDao.updateResourceRef(resourceRef);
    }

    // *********************************************************************************************
    // create a resource for a document
    // *********************************************************************************************

    /**
     * Create a resource
     *
     * @param resourceCreationBean Everything needed to create a resource
     *
     * @return the brand new resource id
     */
    @POST
    @Path("create")
    public Long createResource(ResourceCreationBean resourceCreationBean) {
        logger.debug("create resource {}", resourceCreationBean);

        Resource resource = new Resource();
        resource.setTitle(resourceCreationBean.getTitle());
        resource.setTeaser(resourceCreationBean.getTeaser());
        resource.setDocument(resourceCreationBean.getDocument());
        resource.setCategory(resourceCreationBean.getCategory());
        resource.setAbstractCardTypeId(resourceCreationBean.getAbstractCardTypeId());
        resource.setCardId(resourceCreationBean.getCardId());
        resource.setCardContentId(resourceCreationBean.getCardContentId());

        resourceCreationBean.getDocument().setResource(resource);

        return resourceManager.createResource(resource).getId();
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
    @Path("{id}")
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
    @Path("setCategory/{resourceOrRefId}")
    public void setCategory(@PathParam("resourceOrRefId") Long resourceOrRefId,
        String categoryName) {
        logger.debug("add resource/ref #{} to category {}", resourceOrRefId, categoryName);
        resourceCategoryHelper.setCategory(resourceOrRefId, categoryName);
    }

    /**
     * Set the category of a list of resources
     *
     * @param resourceOrRefIds the id of the resources / resource references
     * @param categoryName     the name of the category that apply to the resource / resource
     *                         reference
     */
    @PUT
    @Path("setCategory/list/{newName}")
    public void setCategoryForList(@PathParam("newName") String categoryName,
        List<Long> resourceOrRefIds) {
        logger.debug("add resource/ref #{} to category {}", resourceOrRefIds, categoryName);
        resourceCategoryHelper.setCategory(resourceOrRefIds, categoryName);
    }

    /**
     * Remove the category of the resource / resource reference
     *
     * @param resourceOrRefId the id of the resource / resource reference
     */
    @PUT
    @Path("removeCategory/{resourceOrRefId}")
    public void removeCategory(@PathParam("resourceOrRefId") Long resourceOrRefId) {
        logger.debug("remove category from resource/ref #{}", resourceOrRefId);
        resourceCategoryHelper.removeCategory(resourceOrRefId);
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
        resourceCategoryHelper.removeCategory(resourceOrRefIds);
    }

    /**
     * Rename the category in a card type / card type reference
     *
     * @param cardTypeOrRefId the id of the card type / card type reference (scope of the renaming)
     * @param projectId       the id of the project concerned (scope of the renaming)
     * @param oldName         the old name of the category
     * @param newName         the new name of the category
     */
    @PUT
    @Path("renameCategory/cardType/{projectId}/{cardTypeId}/{oldName}")
    public void renameCategoryForCardType(@PathParam("projectId") Long projectId,
        @PathParam("cardTypeId") Long cardTypeOrRefId, @PathParam("oldName") String oldName,
        String newName) {
        logger.debug("rename category {} to {} for card type #{} in the project {}", oldName,
            newName, cardTypeOrRefId, projectId);
        resourceCategoryHelper.renameCategoryInCardType(cardTypeOrRefId, projectId, oldName,
            newName);
    }

    /**
     * Rename the category in a card
     *
     * @param cardId  the id of the card
     * @param oldName the old name of the category
     * @param newName the new name of the category
     */
    @PUT
    @Path("renameCategory/card/{cardId}/{oldName}")
    public void renameCategoryForCard(@PathParam("cardId") Long cardId,
        @PathParam("oldName") String oldName, String newName) {
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
    @Path("renameCategory/cardContent/{cardContentId}/{oldName}")
    public void renameCategoryForCardContent(@PathParam("cardContentId") Long cardContentId,
        @PathParam("oldName") String oldName, String newName) {
        logger.debug("rename category {} to {} for card content #{}", oldName, newName,
            cardContentId);
        resourceCategoryHelper.renameCategoryInCardContent(cardContentId, oldName, newName);
    }

    // *********************************************************************************************
    // links
    // *********************************************************************************************

    /**
     * Get all sticky note links where the resource / resource reference is the source
     *
     * @param resourceOrRefId the id of the resource / resource reference
     *
     * @return list of links
     */
    @GET
    @Path("{id}/StickyNoteLinks")
    public List<StickyNoteLink> getStickyNoteLinksAsSrc(@PathParam("id") Long resourceOrRefId) {
        logger.debug("Get sticky note links to abstract resource #{} as source", resourceOrRefId);
        return resourceManager.getStickyNoteLinkAsSrc(resourceOrRefId);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
