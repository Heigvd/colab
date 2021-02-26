/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.tests;

import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.AuthInfo;
import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.SignUpInfo;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.rest.config.JsonbProvider;
import java.io.IOException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;
import javax.ws.rs.ClientErrorException;
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
 * coLAB rest client
 *
 * @author maxence
 */
public class ColabRestClient {

    private WebTarget webTarget;
    private Client client;

    private String colabSessionId;

    public ColabRestClient(String baseUri) {
        client = ClientBuilder.newBuilder()
            .register(new JsonbProvider())
            .register(new CookieFilter(this))
            .build();
        webTarget = client.target(baseUri);
    }

    private String getSessionId() {
        return colabSessionId;
    }

    private void setSessionId(String sessionId) {
        this.colabSessionId = sessionId;
    }

    public void close() {
        client.close();
    }

    private <T> T get(String path, Class<T> klass) {
        return webTarget.path(path).request()
            .accept(MediaType.APPLICATION_JSON)
            .get(klass);
    }

    private <T> T get(String path, GenericType<T> type) {
        return webTarget.path(path).request()
            .accept(MediaType.APPLICATION_JSON)
            .get(type);
    }

    private <T> T delete(String path, Class<T> klass) {
        return webTarget.path(path).request()
            .accept(MediaType.APPLICATION_JSON)
            .delete(klass);
    }

    private <T> T post(String path, Object body, Class<T> klass) {
        return webTarget.path(path).request()
            .accept(MediaType.APPLICATION_JSON)
            .post(Entity.entity(body, MediaType.APPLICATION_JSON_TYPE), klass);
    }

    private <T> T put(String path, Object body, Class<T> klass) {
        return webTarget.path(path).request()
            .accept(MediaType.APPLICATION_JSON)
            .put(Entity.entity(body, MediaType.APPLICATION_JSON_TYPE), klass);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // USER CONTROLLER
    ////////////////////////////////////////////////////////////////////////////////////////////////
    public AuthMethod getAuthMethod(String email) throws ClientErrorException {
        return get(MessageFormat.format("api/users/AuthMethod/{0}", email), AuthMethod.class);
    }

    public User getCurrentUser() throws ClientErrorException {
        return get("api/users/CurrentUser", User.class);
    }

    public Account getCurrentAccount() throws ClientErrorException {
        return get("api/users/CurrentAccount", Account.class);
    }

    public void signUp(SignUpInfo signup) throws ClientErrorException {
        this.post("api/users/SignUp", signup, void.class);
    }

    public void signIn(AuthInfo signInInfo) throws ClientErrorException {
        this.post("api/users/SignIn", signInInfo, void.class);
    }

    public void signOut() throws ClientErrorException {
        this.post("api/users/SignOut", null, void.class);
    }

    public void updateUser(User user) {
        this.put("api/users", user, void.class);
    }

    public void grantAdminRight(Long id) {
        String path = MessageFormat.format("api/users/{0}/GrantAdminRight", id);
        this.put(path, "", void.class);
    }

    public void switchClientHashMethod(Long id) {
        String path = MessageFormat.format("api/users/{0}/SwitchClientHashMethod", id);
        this.put(path, "", void.class);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // PROJECT CONTROLLER
    ////////////////////////////////////////////////////////////////////////////////////////////////
    public Long createProject(Project project) {
        return this.post("api/projects", project, Long.class);
    }

    public Project getProject(Long id) {
        return this.get("api/projects/" + id, Project.class);
    }

    public void updateProject(Project project) {
        this.put("api/projects", project, void.class);
    }

    public void deleteProject(Long id) {
        this.delete("api/projects/" + id, void.class);
    }

    public List<Project> getAllProject() {
        return this.get("api/projects",
            new GenericType<List<Project>>() {
        });
    }

    /**
     * Cookie filter make sure the session cookie is set
     */
    public static class CookieFilter implements ClientRequestFilter, ClientResponseFilter {

        private final ColabRestClient client;

        public CookieFilter(ColabRestClient client) {
            this.client = client;
        }

        @Override
        public void filter(ClientRequestContext requestContext) throws IOException {
            if (client.getSessionId() != null) {
                List<Object> cookies = new ArrayList<>();
                Cookie cookie = new Cookie("COLAB_SESSION_ID", client.getSessionId());
                cookies.add(cookie);
                requestContext.getHeaders().put("Cookie", cookies);
            }
        }

        @Override
        public void filter(ClientRequestContext requestContext, ClientResponseContext responseContext) throws IOException {
            NewCookie get = responseContext.getCookies().get("COLAB_SESSION_ID");
            if (get != null) {
                client.setSessionId(get.getValue());
            }
        }

    }
}
