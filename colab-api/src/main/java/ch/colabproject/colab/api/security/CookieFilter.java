/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security;

import ch.colabproject.colab.api.ejb.RequestManager;
import java.io.IOException;
import javax.inject.Inject;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.ext.Provider;

/**
 * Intercept all request to the API. Make sure COLAB_SESSION_ID exists
 *
 * @author maxence
 */
@Provider
public class CookieFilter implements ContainerRequestFilter, ContainerResponseFilter {

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
    private static final String COOKIE_NAME = "COLAB_COOKIE_ID";

    /**
     * Intercept request and make sure a httpSession is bound to the request
     *
     * @param requestContext
     *
     * @throws IOException
     */
    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        Cookie cookie = requestContext.getCookies().get(COOKIE_NAME);
        String sessionId = null;
        if (cookie != null) {
            sessionId = cookie.getValue();
        }
        HttpSession httpSession = sessionManager.getOrCreate(sessionId);
        requestManager.setHttpSession(httpSession);
    }

    /**
     * Intercept response, save httpSession in sessions cache and make sure set-cookie is set
     *
     * @param requestContext
     * @param responseContext
     *
     * @throws IOException
     */
    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        HttpSession session = requestManager.getHttpSession();

        session.keepAlive();
        sessionManager.save(session);

        NewCookie sessionCookie = new NewCookie(COOKIE_NAME, session.getSessionId(),
            null, null, null, -1, true, true);

        responseContext.getCookies().put(COOKIE_NAME, sessionCookie);
    }

}
