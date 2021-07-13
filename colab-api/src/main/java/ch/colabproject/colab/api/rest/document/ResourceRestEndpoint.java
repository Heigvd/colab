/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.document;

import ch.colabproject.colab.api.ejb.ResourceFacade;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.document.ResourceDao;
import ch.colabproject.colab.api.persistence.document.ResourceRefDao;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import java.util.List;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
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
    // *********************************************************************************************

    /**
     * The resource persistence manager
     */
    @Inject
    private ResourceDao resourceDao;

    /**
     * The resource reference persistence manager
     */
    @Inject
    private ResourceRefDao resourceRefDao;

    /**
     * The resource-related logic
     */
    @Inject
    private ResourceFacade resourceFacade;

    // *********************************************************************************************
    // RU
    // *********************************************************************************************

    /**
     * Get the resource identified by the given id
     *
     * @param id the id of the resource to fetch
     *
     * @return the resource or null
     */
    @GET
    @Path("{id}")
    public Resource getResource(@PathParam("id") Long id) {
        logger.debug("get resource #{}", id);
        return resourceDao.findResource(id);
    }

    /**
     * Get the resource reference identified by the given id
     *
     * @param id the id of the resource reference to fetch
     *
     * @return the resource reference or null
     */
    @GET
    @Path("ref/{id}")
    public ResourceRef getResourceReference(@PathParam("id") Long id) {
        logger.debug("get resource reference #{}", id);
        return resourceRefDao.findResourceRef(id);
    }

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
        resourceDao.updateResource(resource);
    }

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
        resourceRefDao.updateResourceRef(resourceRef);
    }

    // *********************************************************************************************
    // create a resource for a document
    // *********************************************************************************************

    /**
     * Create a resource to link the document and the card type and create a reference to that new
     * resource for each child (recursively)
     *
     * @param document   the document represented by the new resource
     * @param cardTypeId the id of the card type the resource must be linked to
     *
     * @return id of the persisted new resource
     */
    @POST
    @Path("createForCardType/{cardTypeId}")
    public Resource createResourceForCardType(@PathParam("cardTypeId") Long cardTypeId,
        Document document) {
        logger.debug("create resource for document {} and card type #{}", document,
            cardTypeId);
        return resourceFacade.createResourceForCardType(document, cardTypeId);
    }

    /**
     * Create a resource to link the document and the card and create a reference to that new
     * resource for each child (recursively)
     *
     * @param document the document represented by the new resource
     * @param cardId   the id of the card the resource must be linked to
     *
     * @return id of the persisted new resource
     */
    @POST
    @Path("createForCard/{cardId}")
    public Resource createResourceForCard(@PathParam("cardId") Long cardId, Document document) {
        logger.debug("create resource for document {} and cardId #{}", document, cardId);
        return resourceFacade.createResourceForCard(document, cardId);
    }

    /**
     * Create a resource to link the document and the card content and create a reference to that
     * new resource for each child (recursively)
     *
     * @param document      the document represented by the new resource
     * @param cardContentId the id of the card content the resource must be linked to
     *
     * @return id of the persisted new resource
     */
    @POST
    @Path("createForCardContent/{cardContentId}")
    public Resource createResourceForCardContent(@PathParam("cardContentId") Long cardContentId,
        Document document) {
        logger.debug("create resource for document {} and card content #{}", document,
            cardContentId);
        return resourceFacade.createResourceForCardContent(document, cardContentId);
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
        resourceFacade.setCategory(resourceOrRefId, categoryName);
    }

    /**
     * Set the category of a list of resources
     *
     * @param resourceOrRefIds the id of the resources / resource references
     * @param categoryName     the name of the category that apply to the resource / resource
     *                         reference
     */
    // Note : Sandra : I would have preferred to send the ids in the path
    @PUT
    @Path("setCategory/list/{newName}")
    public void setCategoryForList(@PathParam("newName") String categoryName,
        List<Long> resourceOrRefIds) {
        logger.debug("add resource/ref #{} to category {}", resourceOrRefIds, categoryName);
        resourceFacade.setCategory(resourceOrRefIds, categoryName);
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
        resourceFacade.removeCategory(resourceOrRefId);
    }

    /**
     * Remove the category of a list of resources / resource references
     *
     * @param resourceOrRefIds the id of the resources / resource references
     */
    // Note : Sandra : I would have preferred to send the ids in the path
    @PUT
    @Path("removeCategory/list")
    public void removeCategoryForList(List<Long> resourceOrRefIds) {
        logger.debug("remove category from resource/ref #{}", resourceOrRefIds);
        resourceFacade.removeCategory(resourceOrRefIds);
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
        resourceFacade.renameCategoryInCardType(cardTypeOrRefId, projectId, oldName, newName);
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
        resourceFacade.renameCategoryInCard(cardId, oldName, newName);
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
        resourceFacade.renameCategoryInCardContent(cardContentId, oldName, newName);
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
        return resourceFacade.getStickyNoteLinkAsSrc(resourceOrRefId);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

    // TODO smart propagation handling

    // TODO see if we could have a light handling of cards + type + content on client side
}
