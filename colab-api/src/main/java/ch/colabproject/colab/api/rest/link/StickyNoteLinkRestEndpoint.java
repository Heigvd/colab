/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.link;

import ch.colabproject.colab.api.ejb.StickyNoteLinkFacade;
import ch.colabproject.colab.api.ejb.StickyNoteLinkFacade.SrcType;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.jpa.link.StickyNoteLinkDao;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
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
    private StickyNoteLinkFacade linkFacade;

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
     * Save changes to database
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
     * @param linkCreationBean Everything needed to create a link
     *
     * @return id of the persisted new link
     */
    @POST
    public Long createLink(StickyNoteLinkCreationBean linkCreationBean) {
        logger.debug("create link {}", linkCreationBean);

        StickyNoteLink link = new StickyNoteLink();
        link.setSrcCardId(linkCreationBean.getSrcCardId());
        link.setSrcCardContentId(linkCreationBean.getSrcCardContentId());
        link.setSrcResourceOrRefId(linkCreationBean.getSrcResourceOrRefId());
        link.setSrcBlockId(linkCreationBean.getSrcBlockId());
        link.setDestinationCardId(linkCreationBean.getDestinationCardId());
        link.setTeaser(linkCreationBean.getTeaser());
        link.setExplanation(linkCreationBean.getExplanation());

        return linkFacade.createStickyNoteLink(link).getId();
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
        linkFacade.deleteStickyNoteLink(id);
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
        linkFacade.changeStickyNoteLinkSource(linkId, SrcType.CARD, cardId);
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
        linkFacade.changeStickyNoteLinkSource(linkId, SrcType.CARD_CONTENT, cardContentId);
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
        linkFacade.changeStickyNoteLinkSource(linkId, SrcType.RESOURCE_OR_REF, resourceOrRefId);
    }

    /**
     * Change the source for a block
     *
     * @param linkId  the id of the link to update
     * @param blockId the id of the new source object
     */
    @PUT
    @Path("changeSrc/{linkId}/Block")
    public void changeSrcWithBlock(@PathParam("linkId") Long linkId, Long blockId) {
        logger.debug("change link #{} with new block source #{}", linkId, blockId);
        linkFacade.changeStickyNoteLinkSource(linkId, SrcType.BLOCK, blockId);
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
        linkFacade.changeStickyNoteLinkDestination(linkId, cardId);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
