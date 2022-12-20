/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.utils.filter;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.model.user.User;
import java.io.IOException;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Extract baseUrl and print log statement for all REST requests.
 * <p>
 * With a priority of 2, this filter is executed right after
 * {@link ch.colabproject.colab.api.security.CookieFilter CookieFilter} one.
 *
 * @author maxence
 */
@Provider
@Priority(2)
public class RequestFilter implements ContainerRequestFilter, ContainerResponseFilter {

    /**
     * Logger
     */
    private static final Logger log = LoggerFactory.getLogger(RequestFilter.class);

    /**
     * Request related logic
     */
    @Inject
    private RequestManager requestManager;

    /**
     * Intercept request and make sure a httpSession is bound to the request
     *
     * @param requestContext request context
     *
     * @throws IOException if an I/O exception occurs.
     */
    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        requestManager.setStartTime(System.currentTimeMillis());

        requestManager.setRequestContext(requestContext);

        // request base url starts with REST @ApplicationPath = "api", remove such suffix
        requestManager.setBaseUrl(
            requestContext.getUriInfo().getBaseUri().toString()
                .replaceFirst("/api/$", "")
        );

        log.info("START {} {}",
            requestContext.getRequest().getMethod(),
            requestContext.getUriInfo().getPath());
    }

    /**
     * Intercept response, save httpSession in sessions cache and make sure set-cookie header is set
     *
     * @param requestContext  the request context
     * @param responseContext the response context
     *
     * @throws IOException if an I/O exception occurs.
     */
    @Override
    public void filter(ContainerRequestContext requestContext,
        ContainerResponseContext responseContext) throws IOException {
        long startTime = requestManager.getStartTime();
        User user = requestManager.getCurrentUser();

        log.info("{} {} {} ({}) completed in {} ms",
            responseContext.getStatus(),
            requestContext.getRequest().getMethod(),
            requestContext.getUriInfo().getPath(),
            user != null ? user.getUsername() : "anonymous",
            System.currentTimeMillis() - startTime);
    }

}
