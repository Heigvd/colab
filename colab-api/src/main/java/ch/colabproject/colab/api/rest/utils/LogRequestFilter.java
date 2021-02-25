/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.utils;

import ch.colabproject.colab.api.ejb.RequestManager;
import ch.colabproject.colab.api.model.user.User;
import java.io.IOException;
import javax.annotation.Priority;
import javax.inject.Inject;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.ext.Provider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Log request
 *
 * @author maxence
 */
@Provider
@Priority(100)
public class LogRequestFilter implements ContainerRequestFilter, ContainerResponseFilter {

    /**
     * Logger
     */
    private static final Logger log = LoggerFactory.getLogger(LogRequestFilter.class);

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
