/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.plugin.rest;

import ch.colabproject.colab.generator.model.exceptions.HttpException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.json.bind.Jsonb;
import javax.json.bind.JsonbBuilder;
import javax.json.bind.JsonbException;
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
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import org.glassfish.jersey.media.multipart.FormDataMultiPart;

/**
 * JakartaEE-based rest client.
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
     * Jsonb mapper
     */
    private final Jsonb jsonb;

    /**
     * Create a REST client.
     *
     * @param baseUri        base URL
     * @param cookieName     session cookie name
     * @param jsonb          jsonb mapper to use, if null a default mapper will be used
     * @param clientFeatures REST client feature
     */
    public RestClient(String baseUri, String cookieName, Jsonb jsonb, Object... clientFeatures) {
        ClientBuilder builder = ClientBuilder.newBuilder();

        for (Object feature : clientFeatures) {
            builder.register(feature);
        }

        if (cookieName != null && !cookieName.isBlank()) {
            builder.register(new CookieFilter(cookieName));
        }

        this.client = builder.build();
        this.webTarget = client.target(baseUri);

        if (jsonb != null) {
            this.jsonb = jsonb;
        } else {
            this.jsonb = JsonbBuilder.create();
        }
    }

    /**
     * Close the client.
     */
    public void close() {
        client.close();
    }

    /**
     * Try to read entity
     *
     * @param <T>    entity type
     * @param stream input stream to read from
     * @param type   entity type
     *
     * @return instance of T or null
     */
    private <T> T readEntity(InputStream stream, GenericType<T> type) {
        try {
            if (stream != null && stream.available() > 0) {
                return jsonb.fromJson(stream, type.getType());
            } else {
                return null;
            }
        } catch (JsonbException | IOException ex) {
            // silent ex
            return null;
        }
    }

    /**
     * Convert InputStream to string
     *
     * @param stream the stream to convert
     *
     * @return the content of the stream as string
     */
    private String readTextualEntity(InputStream stream) {
        try {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            // silent ex
            return null;
        }
    }

    private <T> T processResponse(Response response, GenericType<T> type) {
        Status.Family family = Status.Family.familyOf(response.getStatus());
        if (family == Status.Family.SUCCESSFUL) {
            if (response.getStatus() == 204) {
                return null;
            } else {
                Object entity = response.getEntity();
                if (entity instanceof InputStream) {
                    InputStream stream = (InputStream) entity;
                    String contentType = response.getHeaderString("Content-Type");
                    if (contentType.equals("application/json")
                        || contentType.equals("text/json")) {
                        return readEntity(stream, type);
                    } else if (contentType.equals("text/plain")
                        || contentType.equals("text/html")) {
                        if (type.getRawType() == String.class) {
                            return (T) readTextualEntity(stream);
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            }
        } else if (family == Status.Family.CLIENT_ERROR) {
            HttpException error = readEntity((InputStream) response.getEntity(),
                new GenericType<>(HttpException.class));
            if (error != null) {
                throw error;
            } else {
                throw new ClientException(Status.fromStatusCode(response.getStatus()));
            }
        } else if (family == Status.Family.SERVER_ERROR) {
            throw new ServerException(Status.fromStatusCode(response.getStatus()));
        } else {
            throw new ServerException(Status.fromStatusCode(response.getStatus()));
        }
    }

    /**
     * send GET request.
     *
     * @param <T>    expected return type
     * @param path   rest path
     * @param type   expected return generic type
     * @param accept list of accepted MIME types
     *
     * @return instance of T
     */
    public <T> T get(String path, GenericType<T> type, String... accept) {
        return processResponse(webTarget.path(path).request()
            .accept(accept).get(),
            type);
    }

    /**
     * send DELETE request.
     *
     * @param <T>    expected return type
     * @param path   rest path
     * @param type   expected return type
     * @param accept list of accepted MIME types
     *
     * @return instance of T
     */
    public <T> T delete(String path, GenericType<T> type, String... accept) {
        return processResponse(webTarget.path(path).request()
            .accept(accept).delete(),
            type);
    }

    /**
     * send JSON POST request.
     *
     * @param <T>    expected return type
     * @param path   rest path
     * @param body   POST body
     * @param type   expected return type
     * @param accept list of accepted MIME types
     *
     * @return instance of T
     */
    public <T> T post(String path, Object body, GenericType<T> type, String... accept) {
        return processResponse(webTarget.path(path).request()
            .accept(accept)
            .post(Entity.entity(body, MediaType.APPLICATION_JSON_TYPE)),
            type);
    }

    /**
     * send multipart form POST request.
     *
     * @param <T>    expected return type
     * @param path   rest path
     * @param fields form data
     * @param type   expected return type
     * @param accept list of accepted MIME types
     *
     * @return instance of T
     */
    public <T> T post(
        String path,
        Map<String, FormField> fields,
        GenericType<T> type,
        String... accept
    ) {
        FormDataMultiPart multipart = new FormDataMultiPart();

        fields.forEach((fieldName, data) -> {
            multipart.field(fieldName, data.getData(), data.getMimeType());
        });

        return processResponse(webTarget.path(path).request()
            .accept(accept)
            .post(Entity.entity(multipart, multipart.getMediaType())),
            type);
    }

    /**
     * send POST request with an empty body.
     *
     * @param <T>    expected return type
     * @param path   rest path
     * @param type   expected return type
     * @param accept list of accepted MIME types
     *
     * @return instance of T
     */
    public <T> T post(String path, GenericType<T> type, String... accept) {
        return this.post(path, "", type, accept);
    }

    /**
     * send PUT request with JSON body.
     *
     * @param <T>    expected return type
     * @param path   rest path
     * @param body   POST body
     * @param type   expected return type
     * @param accept list of accepted MIME types
     *
     * @return instance of T
     */
    public <T> T put(String path, Object body, GenericType<T> type, String... accept) {
        return processResponse(webTarget.path(path).request()
            .accept(accept)
            .put(Entity.entity(body, MediaType.APPLICATION_JSON_TYPE)),
            type);
    }

    /**
     * send multipart form PUT request.
     *
     * @param <T>    expected return type
     * @param path   rest path
     * @param fields form data
     * @param type   expected return type
     * @param accept list of accepted MIME types
     *
     * @return instance of T
     */
    public <T> T put(String path, Map<String, FormField> fields, GenericType<T> type, String... accept) {
        FormDataMultiPart multipart = new FormDataMultiPart();

        fields.forEach((fieldName, data) -> {
            multipart.field(fieldName, data.getData(), data.getMimeType());
        });

        return processResponse(webTarget.path(path).request()
            .accept(accept)
            .put(Entity.entity(multipart, multipart.getMediaType())),
            type);
    }

    /**
     * send PUT request with an empty body.
     *
     * @param <T>    expected return type
     * @param path   rest path
     * @param type   expected return type
     * @param accept list of accepted MIME types
     *
     * @return instance of T
     */
    public <T> T put(String path, GenericType<T> type, String... accept) {
        return this.put(path, "", type, accept);

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
        public void filter(ClientRequestContext requestContext,
            ClientResponseContext responseContext) throws IOException {
            NewCookie get = responseContext.getCookies().get(cookieName);
            if (get != null) {
                this.sessionId = get.getValue();
            }
        }

    }
}
