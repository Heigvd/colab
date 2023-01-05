/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.document;

import ch.colabproject.colab.api.controller.document.ExternalDataManager;
import ch.colabproject.colab.api.rest.document.bean.UrlMetadata;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import ch.colabproject.colab.generator.model.tools.JsonbProvider;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

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
