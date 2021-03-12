/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.ejb.TokenDao;
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
 * API to fetch an consume tokens sent by e-mail
 *
 * @author maxence
 */
@Path("tokens")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class TokenController {

    /**
     * token data access
     */
    @Inject
    private TokenDao tokenDao;

    /**
     * Fetch a token by id. Once fetched, the client should decide what to do. If the token does not
     * require authentication, client may consume the token directly. If the token require
     * authentication, the client should ask the user to sing in/up and consume the token
     * eventually.
     *
     * @param id of the token to fetch.
     *
     * @return the token
     */
    @GET
    @Path("{id}")
    public Token getToken(@PathParam("id") Long id) {
        return tokenDao.getToken(id);
    }

    /**
     * Consume and destroy the token
     *
     * @param id         if of the token to consume
     * @param plainToken plain token as receive by e-mail
     *
     * @throws ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage <ul>
     * <li>notFound if the token does not exists;
     * <li>bad request if token does not match;
     * <li>authenticationRequired if token requires authentication but current user id not
     * </ul>
     */
    @PUT
    @Path("{id}/{token: [a-fA-F0-9]+}")
    public void consumeToken(
        @PathParam("id") Long id,
        @PathParam("token") String plainToken
    ) {
        tokenDao.consume(id, plainToken);
    }
}
