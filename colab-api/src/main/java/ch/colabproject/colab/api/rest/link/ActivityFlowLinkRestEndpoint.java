/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.link;

import ch.colabproject.colab.api.ejb.ActivityFlowLinkFacade;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.persistence.link.ActivityFlowLinkDao;
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
    private ActivityFlowLinkFacade linkFacade;

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
//     * Save changes to database
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
        return linkFacade.createActivityFlowLink(link).getId();
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
        linkFacade.deleteActivityFlowLink(id);
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
        linkFacade.changeActivityFlowLinkPrevious(linkId, cardId);
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
        linkFacade.changeActivityFlowLinkNext(linkId, cardId);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
