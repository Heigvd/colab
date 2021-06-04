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
import ch.colabproject.colab.api.persistence.document.ResourceDao;
import ch.colabproject.colab.api.persistence.document.ResourceRefDao;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
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
    //
    // *********************************************************************************************

}
