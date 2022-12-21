/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security;

import ch.colabproject.colab.api.model.user.HttpSession;
import ch.colabproject.colab.api.controller.RequestManager;
import java.io.IOException;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.container.PreMatching;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.ext.Provider;
import org.apache.commons.lang3.StringUtils;
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

    /** Default max-age to one week [s] */
    private static final int COOKIE_MAX_AGE = 3600 * 24 * 7;

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
     * To parse cookie values
     */
    private static class ParsedCookie {

        /**
         * Http Session id
         */
        private Long id = null;

        /**
         * Http session secret
         */
        private String secret = null;

        /**
         * Parse the cookie value
         *
         * @param value cookie value to parse
         */
        public ParsedCookie(String value) {
            logger.trace("Parse cookie value");

            // The cookie: uid=1234:v=<SECRET>
            String[] split = value.split(":");
            if (split.length == 2) {
                try {
                    if (split[0].length() >= 5 && split[1].length() >= 3) {
                        this.id = Long.parseLong(split[0].substring(4), 10);
                        this.secret = split[1].substring(2);
                    } else {
                        logger.error("Invalid cookie: struct not match");
                    }
                } catch (NumberFormatException ex) {
                    logger.error("Invalid cookie: v=<NOT_A_NUBER>;...");
                }
            }
        }
    }

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
        if (cookie != null) {
            String cookieValue = cookie.getValue();
            logger.trace("Request received with session id {}", cookieValue);

            ParsedCookie parsedCookie = new ParsedCookie(cookieValue);
            if (parsedCookie.id != null && parsedCookie.secret != null) {
                HttpSession httpSession = sessionManager.getAndValidate(parsedCookie.id, parsedCookie.secret);
                if (httpSession != null) {
                    requestManager.setHttpSessionId(httpSession.getId());
                    return;
                }
            } else {
                logger.debug("Invalid cookie: reject");
            }
            requestManager.setHttpSessionId(null);
        }
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
        Cookie cookie = requestContext.getCookies().get(COOKIE_NAME);
        if (session != null) {
            String cookieValue = null;

            if (cookie != null && !StringUtils.isEmpty(cookie.getValue())) {
                cookieValue = cookie.getValue();
                ParsedCookie parsedCookie = new ParsedCookie(cookieValue);
                if (!parsedCookie.id.equals(session.getId())) {
                    logger.trace("New httpSession detected");
                    // session changed during the request => clear cookieValue to force to generate
                    // a full new cookie
                    cookieValue = null;
                }
            }

            if (cookieValue == null) {
                logger.trace("CookieValue not set: build from rawSecret");
                // CookieValue not set -> build from
                if (StringUtils.isBlank(session.getRawSessionSecret())) {
                    // at login, new httpSession is created (SessionManager.createHttpSession)
                    // the raw secret must be available here to be sent to client
                    logger.error("COOKIE VALUE IS NOT SET");
                }
                cookieValue = "uid=" + session.getId() + ":v=" + session.getRawSessionSecret();
            }

            NewCookie sessionCookie = new NewCookie.Builder(COOKIE_NAME)
                .value(cookieValue)
                .path("/")
                .domain(null)
                .comment(null)
                .maxAge(COOKIE_MAX_AGE)
                .secure(true)
                .httpOnly(true)
                .sameSite(NewCookie.SameSite.LAX)
                .build();

            logger.trace("Request completed with session id {}", session.getId());
            responseContext.getHeaders().add(HttpHeaders.SET_COOKIE, sessionCookie);
        } else {
            // not session => clear cookie if exists
            if (cookie != null) {
                // Clear cookie by setting no value and max-age=0
                NewCookie sessionCookie = new NewCookie.Builder(COOKIE_NAME)
                    .path("/")
                    .maxAge(0)
                    .secure(true)
                    .httpOnly(true)
                    .build();

                logger.trace("Request completed with session id {}", sessionCookie);
                responseContext.getHeaders().add(HttpHeaders.SET_COOKIE, sessionCookie);
            }
        }
    }

}
