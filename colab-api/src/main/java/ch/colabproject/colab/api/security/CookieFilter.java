/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security;

import ch.colabproject.colab.api.ejb.RequestManager;
import java.io.IOException;
import javax.annotation.Priority;
import javax.inject.Inject;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.container.PreMatching;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.ext.Provider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Intercept all request to the API. Make sure COLAB_SESSION_ID exists
 * <p>
 * With a priority of 1, this {@link PreMatching @PreMatching} filter is the very first to be
 * executed
 *
 * @author maxence
 */
@Provider
@Priority(1)
@PreMatching
public class CookieFilter implements ContainerRequestFilter, ContainerResponseFilter {

    /**
     * Logger
     */
    private static final Logger logger = LoggerFactory.getLogger(CookieFilter.class);

    /**
     * Cluster-wide session cache.
     */
    @Inject
    private SessionManager sessionManager;

    /**
     * Request related logic
     */
    @Inject
    private RequestManager requestManager;

    /**
     * Name of the cookie
     */
    private static final String COOKIE_NAME = "COLAB_SESSION_ID";

    /**
     * Intercept request and make sure a httpSession is bound to the request
     *
     * @param requestContext request context
     *
     * @throws IOException if an I/O exception occurs.
     */
    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        Cookie cookie = requestContext.getCookies().get(COOKIE_NAME);
        String sessionId = null;
        if (cookie != null) {
            sessionId = cookie.getValue();
            logger.trace("Request received with session id {}", sessionId);
        }
        HttpSession httpSession = sessionManager.getOrCreate(sessionId);
        requestManager.setHttpSession(httpSession);
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
        HttpSession session = requestManager.getHttpSession();

        session.keepAlive();
        sessionManager.save(session);

        NewCookie sessionCookie = new NewCookie(COOKIE_NAME, session.getSessionId(),
            "/", null, null, -1, true, true);

        logger.trace("Request completed with session id {}", sessionCookie);
        responseContext.getHeaders().add(HttpHeaders.SET_COOKIE, sessionCookie);
    }

}
