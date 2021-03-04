/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.rest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.ClientRequestContext;
import javax.ws.rs.client.ClientRequestFilter;
import javax.ws.rs.client.ClientResponseContext;
import javax.ws.rs.client.ClientResponseFilter;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;

/**
 * Jakarta EE based rest client.
 *
 * @author maxence
 */
public class RestClient {

    /**
     * Base URL.
     */
    private WebTarget webTarget;

    /**
     * internal HTTP client.
     */
    private Client client;

    /**
     * Create a REST client.
     *
     * @param baseUri        base URL
     * @param cookieName     session cookie name
     * @param clientFeatures REST client feature
     */
    public RestClient(String baseUri, String cookieName, Object... clientFeatures) {
        ClientBuilder builder = ClientBuilder.newBuilder();

        for (Object feature : clientFeatures) {
            builder.register(feature);
        }

        if (cookieName != null && !cookieName.isBlank()) {
            builder.register(new CookieFilter(cookieName));
        }

        client = builder.build();
        webTarget = client.target(baseUri);
    }

    /**
     * Close the client.
     */
    public void close() {
        client.close();
    }

    /**
     * send GET request.
     *
     * @param <T>   expected return type
     * @param path  rest path
     * @param klass expected return type
     *
     * @return instance of T
     */
    public <T> T get(String path, Class<T> klass) {
        return webTarget.path(path).request()
            .accept(MediaType.APPLICATION_JSON)
            .get(klass);
    }

    /**
     * send GET request.
     *
     * @param <T>  expected return type
     * @param path rest path
     * @param type expected return generic type
     *
     * @return instance of T
     */
    public <T> T get(String path, GenericType<T> type) {
        return webTarget.path(path).request()
            .accept(MediaType.APPLICATION_JSON)
            .get(type);
    }

    /**
     * send DELETE request.
     *
     * @param <T>   expected return type
     * @param path  rest path
     * @param klass expected return type
     *
     * @return instance of T
     */
    public <T> T delete(String path, Class<T> klass) {
        return webTarget.path(path).request()
            .accept(MediaType.APPLICATION_JSON)
            .delete(klass);
    }

    /**
     * send POST request.
     *
     * @param <T>   expected return type
     * @param path  rest path
     * @param body  POST body
     * @param klass expected return type
     *
     * @return instance of T
     */
    public <T> T post(String path, Object body, Class<T> klass) {
        return webTarget.path(path).request()
            .accept(MediaType.APPLICATION_JSON)
            .post(Entity.entity(body, MediaType.APPLICATION_JSON_TYPE), klass);
    }

    /**
     * send POST request with an empty body.
     *
     * @param <T>   expected return type
     * @param path  rest path
     * @param klass expected return type
     *
     * @return instance of T
     */
    public <T> T post(String path, Class<T> klass) {
        return this.post(path, "", klass);
    }

    /**
     * send PUT request.
     *
     * @param <T>   expected return type
     * @param path  rest path
     * @param body  POST body
     * @param klass expected return type
     *
     * @return instance of T
     */
    public <T> T put(String path, Object body, Class<T> klass) {
        return webTarget.path(path).request()
            .accept(MediaType.APPLICATION_JSON)
            .put(Entity.entity(body, MediaType.APPLICATION_JSON_TYPE), klass);
    }

    /**
     * send PUT request with an empty body.
     *
     * @param <T>   expected return type
     * @param path  rest path
     * @param klass expected return type
     *
     * @return instance of T
     */
    public <T> T put(String path, Class<T> klass) {
        return this.put(path, "", klass);
    }

    /**
     * Cookie filter make sure the session cookie is set. The sessionId is set by server response.
     * After the first request, the previously saved sessionId is injected in all requests.
     */
    public static class CookieFilter implements ClientRequestFilter, ClientResponseFilter {

        /**
         * sessionId
         */
        private String sessionId;

        /**
         * Name of the cookie
         */
        private final String cookieName;

        /**
         * New filter
         *
         * @param cookieName name of the cookie to manage
         */
        public CookieFilter(String cookieName) {
            this.cookieName = cookieName;
            this.sessionId = null;
        }

        /**
         * If set, add Cookie header to the request.
         * <p>
         * {@inheritDoc }
         */
        @Override
        public void filter(ClientRequestContext requestContext) throws IOException {
            if (this.sessionId != null) {
                List<Object> cookies = new ArrayList<>();
                Cookie cookie = new Cookie(cookieName, sessionId);
                cookies.add(cookie);
                requestContext.getHeaders().put("Cookie", cookies);
            }
        }

        /**
         * On request response, fetch set-cookie value
         * <p>
         * {@inheritDoc }
         */
        @Override
        public void filter(ClientRequestContext requestContext, ClientResponseContext responseContext) throws IOException {
            NewCookie get = responseContext.getCookies().get(cookieName);
            if (get != null) {
                this.sessionId = get.getValue();
            }
        }

    }
}
