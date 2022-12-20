/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.link;

import ch.colabproject.colab.api.controller.link.ActivityFlowLinkManager;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.persistence.jpa.link.ActivityFlowLinkDao;
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
 * REST activity flow link controller
 *
 * @author sandra
 */
@Path("activityFlowLinks")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class ActivityFlowLinkRestEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory
        .getLogger(ActivityFlowLinkRestEndpoint.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * The activity flow link persistence manager
     */
    @Inject
    private ActivityFlowLinkDao linkDao;

    /**
     * The activity flow link related logic
     */
    @Inject
    private ActivityFlowLinkManager linkManager;

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
    public ActivityFlowLink getLink(@PathParam("id") Long id) {
        logger.debug("get activity flow link #{}", id);
        return linkDao.findActivityFlowLink(id);
    }

//    /**
//     * Save changes to database. Only fields which are editable by users will be impacted.
//     *
//     * @param link link to update
//     *
//     * @throws ColabMergeException if the merge is not possible
//     */
//    @PUT
//    public void updateLink(ActivityFlowLink link) throws ColabMergeException {
//        logger.debug("update activity flow link {}", link);
//        linkDao.updateActivityFlowLink(link);
//    }

    /**
     * Persist the link
     *
     * @param link the link to persist
     *
     * @return id of the persisted new link
     */
    @POST
    public Long createLink(ActivityFlowLink link) {
        logger.debug("create activity flow link {}", link);
        return linkManager.createActivityFlowLink(link).getId();
    }

    /**
     * Permanently delete a link
     *
     * @param id id of the link to delete
     */
    @DELETE
    @Path("{id}")
    public void deleteLink(@PathParam("id") Long id) {
        logger.debug("delete activity flow link #{}", id);
        linkManager.deleteActivityFlowLink(id);
    }

    /**
     * Change the previous card
     *
     * @param linkId the id of the link to update
     * @param cardId the id of the new previous card
     */
    @PUT
    @Path("changePrevious/{linkId}")
    public void changePreviousCard(@PathParam("linkId") Long linkId, Long cardId) {
        logger.debug("change activity flow link #{} previous card to #{}", linkId, cardId);
        linkManager.changeActivityFlowLinkPrevious(linkId, cardId);
    }

    /**
     * Change the next card
     *
     * @param linkId the id of the link to update
     * @param cardId the id of the new next card
     */
    @PUT
    @Path("changeNext/{linkId}")
    public void changeNextCard(@PathParam("linkId") Long linkId, Long cardId) {
        logger.debug("change activity flow link #{} next card to #{}", linkId, cardId);
        linkManager.changeActivityFlowLinkNext(linkId, cardId);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
