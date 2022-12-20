/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.link;

import ch.colabproject.colab.api.controller.link.StickyNoteLinkManager;
import ch.colabproject.colab.api.controller.link.StickyNoteLinkManager.SrcType;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.jpa.link.StickyNoteLinkDao;
import ch.colabproject.colab.api.rest.link.bean.StickyNoteLinkCreationData;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * REST sticky note link controller
 *
 * @author sandra
 */
@Path("stickyNoteLinks")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class StickyNoteLinkRestEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(StickyNoteLinkRestEndpoint.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * The sticky note link persistence manager
     */
    @Inject
    private StickyNoteLinkDao linkDao;

    /**
     * The sticky note link related logic
     */
    @Inject
    private StickyNoteLinkManager linkManager;

    // *********************************************************************************************
    //
    // *********************************************************************************************

    /**
     * Get link identified by the given id
     *
     * @param id id of the link to fetch
     *
     * @return the link or null
     */
    @GET
    @Path("{id}")
    public StickyNoteLink getLink(@PathParam("id") Long id) {
        logger.debug("get link #{}", id);
        return linkDao.findStickyNoteLink(id);
    }

    /**
     * Save changes to database. Only fields which are editable by users will be impacted.
     *
     * @param link link to update
     *
     * @throws ColabMergeException if the merge is not possible
     */
    @PUT
    public void updateLink(StickyNoteLink link) throws ColabMergeException {
        logger.debug("update link {}", link);
        linkDao.updateStickyNoteLink(link);
    }

    /**
     * Persist the link
     *
     * @param linkCreationData Everything needed to create a link
     *
     * @return id of the persisted new link
     */
    @POST
    public Long createLink(StickyNoteLinkCreationData linkCreationData) {
        logger.debug("create link {}", linkCreationData);

        StickyNoteLink link = new StickyNoteLink();
        link.setSrcCardId(linkCreationData.getSrcCardId());
        link.setSrcCardContentId(linkCreationData.getSrcCardContentId());
        link.setSrcResourceOrRefId(linkCreationData.getSrcResourceOrRefId());
        link.setSrcDocumentId(linkCreationData.getSrcDocumentId());
        link.setDestinationCardId(linkCreationData.getDestinationCardId());
        link.setTeaser(linkCreationData.getTeaser());
        link.setExplanation(linkCreationData.getExplanation());

        if (linkCreationData.getExplanation() != null) {
            linkCreationData.getExplanation().setExplainingStickyNoteLink(link);
        }

        return linkManager.createStickyNoteLink(link).getId();
    }

    /**
     * Permanently delete a link
     *
     * @param id id of the link to delete
     */
    @DELETE
    @Path("{id}")
    public void deleteLink(@PathParam("id") Long id) {
        logger.debug("delete link #{}", id);
        linkManager.deleteStickyNoteLink(id);
    }

    /**
     * Change the source for a card
     *
     * @param linkId the id of the link to update
     * @param cardId the id of the new source object
     */
    @PUT
    @Path("changeSrc/{linkId}/Card")
    public void changeSrcWithCard(@PathParam("linkId") Long linkId, Long cardId) {
        logger.debug("change link #{} with new card source #{}", linkId, cardId);
        linkManager.changeStickyNoteLinkSource(linkId, SrcType.CARD, cardId);
    }

    /**
     * Change the source for a card content
     *
     * @param linkId        the id of the link to update
     * @param cardContentId the id of the new source object
     */
    @PUT
    @Path("changeSrc/{linkId}/CardContent")
    public void changeSrcWithCardContent(@PathParam("linkId") Long linkId, Long cardContentId) {
        logger.debug("change link #{} with new card content source #{}", linkId, cardContentId);
        linkManager.changeStickyNoteLinkSource(linkId, SrcType.CARD_CONTENT, cardContentId);
    }

    /**
     * Change the source for a resource / resource reference
     *
     * @param linkId          the id of the link to update
     * @param resourceOrRefId the id of the new source object
     */
    @PUT
    @Path("changeSrc/{linkId}/ResourceOrRef")
    public void changeSrcWithResourceOrRef(@PathParam("linkId") Long linkId, Long resourceOrRefId) {
        logger.debug("change link #{} with new abstract resource source #{}", linkId,
            resourceOrRefId);
        linkManager.changeStickyNoteLinkSource(linkId, SrcType.RESOURCE_OR_REF, resourceOrRefId);
    }

    /**
     * Change the source for a document
     *
     * @param linkId     the id of the link to update
     * @param documentId the id of the new source object
     */
    @PUT
    @Path("changeSrc/{linkId}/Document")
    public void changeSrcWithDocument(@PathParam("linkId") Long linkId, Long documentId) {
        logger.debug("change link #{} with new document source #{}", linkId, documentId);
        linkManager.changeStickyNoteLinkSource(linkId, SrcType.DOCUMENT, documentId);
    }

    /**
     * Change the destination
     *
     * @param linkId the id of the link to update
     * @param cardId the id of the new destination card
     */
    @PUT
    @Path("changeDest/{linkId}")
    public void changeDestination(@PathParam("linkId") Long linkId, Long cardId) {
        logger.debug("change link #{} with new destination card #{}", linkId, cardId);
        linkManager.changeStickyNoteLinkDestination(linkId, cardId);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
