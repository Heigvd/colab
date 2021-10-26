/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.ejb.WebsocketFacade;
import ch.colabproject.colab.api.ws.channel.ChannelOverview;
import ch.colabproject.colab.api.ws.channel.WebsocketEffectiveChannel;
import ch.colabproject.colab.api.ws.message.WsSessionIdentifier;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import java.util.Set;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * API to manage subscription to {@link WebsocketEffectiveChannel}.
 * <p>
 * <u>Note about un/subcriptions protocol:</u> The link between HttpSessionId (cookie) and websocket
 * session id must be known. As the client has no access to its cookie (httpOnly cookie, for
 * security concerns), the subscription is made through the REST methods defined here. Thus, both
 * http session id and websocket session id are known at the same time.
 *
 * @author maxence
 */
@Path("websockets")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class WebsocketRestEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(WebsocketRestEndpoint.class);

    /**
     * Websocket business logic
     */
    @Inject
    private WebsocketFacade wsFacade;

    /**
     * Get the list of all occupied channels.
     *
     * @return list of all occupied channels:
     */
    @GET
    @AdminResource
    public Set<ChannelOverview> getExistingChannels() {
        logger.debug("Get all existing channels");
        return wsFacade.getExistingChannels();
    }

    /**
     * Subscribe to the broadcast channel
     *
     * @param sessionId websocket session id
     */
    @PUT
    @Path("SubscribeToBroadcastChannel")
    public void subscribeToBroadcastChannel(WsSessionIdentifier sessionId) {
        logger.debug("Subscribe to broadcast channel with session id {}", sessionId);
        wsFacade.subscribeToBroadcastChannel(sessionId);
    }

    /**
     * Unsubscribe from a the broadcast channel.
     *
     * @param sessionId websocket session id
     */
    @PUT
    @Path("UnSubscribeFromBroadcastChannel")
    public void unsubscribeFromBroadcastChannel(WsSessionIdentifier sessionId) {
        logger.debug("Unsubscribe from broadcast channel with session id {}", sessionId);
        wsFacade.unsubscribeFromBroadcastChannel(sessionId);
    }

    /**
     * Subscribe to the currentUser channel
     *
     * @param sessionId websocket session id
     *
     */
    @PUT
    @Path("SubscribeToUserChannel")
    public void subscribeToUserChannel(WsSessionIdentifier sessionId) {
        logger.debug("Subscribe to its own userchanell with session id {}", sessionId);
        wsFacade.subscribeToUserChannel(sessionId);
    }

    /**
     * Unsubscribe from the currentUser channel
     *
     * @param sessionId websocket session id
     *
     */
    @PUT
    @Path("UnsubscribeFromUserChannel")
    public void unsubscribeFromUserChannel(WsSessionIdentifier sessionId) {
        logger.debug("Unsubscribe from its own userchanell with session id {}", sessionId);
        wsFacade.unsubscribeFromUserChannel(sessionId);
    }

    /**
     * Subscribe to a ProjectContent channel.
     *
     * @param projectId id of the project
     * @param sessionId websocket session id
     */
    @PUT
    @Path("SubscribeToProjectChannel/{projectId: [0-9]*}")
    public void subscribeToProjectChannel(
        @PathParam("projectId") Long projectId,
        WsSessionIdentifier sessionId
    ) {
        logger.debug("Subscribe to project #{} channel with session id {}",
            projectId, sessionId);
        wsFacade.subscribeToProjectChannel(sessionId, projectId);
    }

    /**
     * Unsubscribe from a ProjectContent channel.
     *
     * @param projectId id of the project
     * @param sessionId websocket session id
     */
    @PUT
    @Path("UnSubscribeFromProjectChannel/{projectId: [0-9]*}")
    public void unsubscribeFromProjectChannel(
        @PathParam("projectId") Long projectId,
        WsSessionIdentifier sessionId
    ) {
        logger.debug("Unsubscribe from project #{} channel with session id {}",
            projectId, sessionId);
        wsFacade.unsubscribeFromProjectChannel(sessionId, projectId);
    }

    /**
     * Subscribe to a BlockChannel.
     *
     * @param blockId   id of the block
     * @param sessionId websocket session id
     */
    @PUT
    @Path("SubscribeToBlockChannel/{blockId: [0-9]*}")
    public void subscribeToBlockChannel(
        @PathParam("blockId") Long blockId,
        WsSessionIdentifier sessionId
    ) {
        logger.debug("Subscribe to block #{} channel with session id {}", blockId, sessionId);
        wsFacade.subscribeToBlockChannel(sessionId, blockId);
    }

    /**
     * Unsubscribe from a BlockContent channel.
     *
     * @param blockId   id of the block
     * @param sessionId websocket session id
     */
    @PUT
    @Path("UnSubscribeFromBlockChannel/{blockId: [0-9]*}")
    public void unsubscribeFromBlockChannel(
        @PathParam("blockId") Long blockId,
        WsSessionIdentifier sessionId
    ) {
        logger.debug("Unsubscribe from block #{} channel with session id {}", blockId, sessionId);
        wsFacade.unsubscribeFromBlockChannel(sessionId, blockId);
    }
}
