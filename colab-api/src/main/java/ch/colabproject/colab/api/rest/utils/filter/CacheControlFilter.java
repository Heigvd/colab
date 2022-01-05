/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.utils.filter;

import java.io.IOException;
import java.util.List;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.ext.Provider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Make sure Cache-Control header is set:
 *
 * @author maxence
 */
@Provider
public class CacheControlFilter implements ContainerResponseFilter {

    /**
     * Cache-Control value
     */
    public static final String NO_CACHE_NO_STORE = "no-cache, no-store, must-revalidate";

    /**
     * Logger
     */
    private static final Logger logger = LoggerFactory.getLogger(CacheControlFilter.class);

    /**
     * Intercept response and make sure Cache-Control header is set. If none, set Cache-Control:
     * no-cache
     *
     * @param requestContext  the request context
     * @param responseContext the response context
     *
     * @throws IOException if an I/O exception occurs.
     */
    @Override
    public void filter(ContainerRequestContext requestContext,
        ContainerResponseContext responseContext) throws IOException {
        List<Object> cc = responseContext.getHeaders().get(HttpHeaders.CACHE_CONTROL);

        if (cc == null || cc.isEmpty()) {
            logger.trace("Set CacheControl to {}", NO_CACHE_NO_STORE);
            responseContext.getHeaders().putSingle(HttpHeaders.CACHE_CONTROL, NO_CACHE_NO_STORE);
        }

    }

}
