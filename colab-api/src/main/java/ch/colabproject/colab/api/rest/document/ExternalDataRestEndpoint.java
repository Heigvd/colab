/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.document;

import ch.colabproject.colab.api.controller.document.ExternalDataManager;
import ch.colabproject.colab.api.rest.document.bean.UrlMetadata;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import ch.colabproject.colab.generator.model.tools.JsonbProvider;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

/**
 *
 * @author maxence
 */
@Path("externaldata")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class ExternalDataRestEndpoint {

    /** external data manager */
    @Inject
    private ExternalDataManager externalDataManager;

    /**
     * Fetch metadata for the given url. If metadata are already known, the cached version is
     * returned.
     *
     * @param url url to fetch metadata for
     *
     * @return metadata
     */
    @PUT
    @Path("urlMetadata")
    public UrlMetadata getUrlMetadata(String url) {
        // seems string body parameter tells jersey to send raw json
        String parsed = JsonbProvider.getJsonb().fromJson(url, String.class);
        return externalDataManager.getUrlMetadata(parsed);
    }

    /**
     * Get refreshed cached metadata
     *
     * @param url url to fetch metadata for
     *
     * @return metadata
     */
    @PUT
    @Path("urlMetadata/refresh")
    public UrlMetadata getRefreshedUrlMetadata(String url) {
        // seems string body parameter tells jersey to send raw json
        String parsed = JsonbProvider.getJsonb().fromJson(url, String.class);
        return externalDataManager.refreshAndGetUrlMetadata(parsed);
    }
}
