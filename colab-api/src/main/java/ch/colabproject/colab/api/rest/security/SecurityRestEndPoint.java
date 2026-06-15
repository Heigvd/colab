/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.security;

import ch.colabproject.colab.api.security.TermsOfUseManager;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

/**
 * REST SecurityRestEndpoint for Terms of Use and Data Policy
 *
 * @author mikkelvestergaard
 */
@Path("security")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class SecurityRestEndPoint {

    /**
     * To get the last timestamp when the Terms of Use and Data Policy were updated
     */
    @Inject
    private TermsOfUseManager termsOfUseManager;

    /**
     * Get the last timestamp when the Terms of Use and Data Policy were updated as a unix timestamp
     *
     * @return Current Terms Of Use timestamp
     */
    @GET
    @Path("getTermsOfUseTimeEpoch")
    public Long getTermsOfUseTimeEpoch() { return termsOfUseManager.getEpochTime(); }
}
