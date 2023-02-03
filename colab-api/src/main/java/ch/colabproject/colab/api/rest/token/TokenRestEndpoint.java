/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.token;

import ch.colabproject.colab.api.controller.token.TokenManager;
import ch.colabproject.colab.api.model.token.Token;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 * API to fetch and consume tokens sent by e-mail.
 * <p>
 * A token grants access to a specific action.
 *
 * @author maxence
 */
@Path("tokens")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class TokenRestEndpoint {

    /**
     * token manager
     */
    @Inject
    private TokenManager tokenManager;

    /**
     * Fetch a token by id.
     * <p>
     * Once fetched, the client should decide what to do. If the token does not require
     * authentication, client may consume the token directly. If the token require authentication,
     * the client should ask the user to sing in/up and consume the token eventually.
     *
     * @param id the id of the token to fetch
     *
     * @return the token
     */
    @GET
    @Path("{id: [0-9]+}")
    public Token getToken(@PathParam("id") Long id) {
        return tokenManager.getNotExpiredToken(id);
    }

    /**
     * Consume and destroy the token
     *
     * @param id         the if of the token to consume
     * @param plainToken the plain token as receive by e-mail
     *
     * @return the consumed token
     *
     * @throws ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage
     *                                                                           <ul>
     *                                                                           <li>notFound if the
     *                                                                           token does not
     *                                                                           exist;
     *                                                                           <li>bad request if
     *                                                                           token does not
     *                                                                           match;
     *                                                                           <li>authenticationRequired
     *                                                                           if token requires
     *                                                                           authentication but
     *                                                                           current user is not
     *                                                                           </ul>
     */
    @PUT
    @Path("{id: [0-9]+}/{token: [a-fA-F0-9]+}")
    public Token consumeToken(
        @PathParam("id") Long id,
        @PathParam("token") String plainToken
    ) {
        return tokenManager.consume(id, plainToken);
    }
}
