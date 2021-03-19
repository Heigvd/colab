/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.ejb.RequestManager;
import ch.colabproject.colab.api.ejb.SecurityFacade;
import ch.colabproject.colab.api.ejb.UserManagement;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.AuthInfo;
import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.SignUpInfo;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 * User controller
 *
 * @author maxence
 */
@Path("users")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class UserController {

    /**
     * Users related business logic
     */
    @Inject
    private UserManagement userManagement;

    /**
     * Request related logic
     */
    @Inject
    private RequestManager requestManager;

    /**
     * to control access
     */
    @Inject
    private SecurityFacade securityFacade;

    /**
     * Get the authentication method and its parameters a user shall use to authenticate with the
     * given email address.
     *
     * @param identifier email address or username the user want to sign in with
     *
     * @return Auth method to user
     */
    @GET
    @Path("AuthMethod/{identifier : [^/]*}")
    public AuthMethod getAuthMethod(@PathParam("identifier") String identifier) {
        return userManagement.getAuthenticationMethod(identifier);
    }

    /**
     * Return the current authenticated user.
     *
     * @return current user or null
     */
    @GET
    @Path("CurrentUser")
    public User getCurrentUser() {
        return requestManager.getCurrentUser();
    }

    /**
     * Return the current authenticated account.
     *
     * @return current account or null
     */
    @GET
    @Path("CurrentAccount")
    public Account getCurrentAccount() {
        return requestManager.getCurrentAccount();
    }

    /**
     * Create a new local account.
     *
     * @param signup all data required to create a local account
     *
     * @throws HttpErrorMessage if creation fails for any reason
     */
    @POST
    @Path("SignUp")
    public void signUp(SignUpInfo signup) {
        userManagement.signup(signup);
    }

    /**
     * Authenticate with local-account credentials.
     *
     * @param authInfo credentials
     *
     * @throws HttpErrorMessage if authentication fails for any reason
     */
    @POST
    @Path("SignIn")
    public void signIn(AuthInfo authInfo) {
        userManagement.authenticate(authInfo);
    }

    /**
     * Sign out.
     */
    @POST
    @Path("SignOut")
    public void signOut() {
        userManagement.logout();
    }

    /**
     * Update user names.
     *
     * @param user user to update
     *
     * @throws ColabMergeException if update fails
     */
    @PUT
    @AuthenticationRequired
    public void updateUser(User user) throws ColabMergeException {
        securityFacade.assertCanWrite(user);
        userManagement.updateUser(user);
    }

    /**
     * Grant admin right to user identified by given id.
     *
     * @param id id of the user
     */
    @PUT
    @Path("{id : [1-9][0-9]*}/GrantAdminRight")
    @AdminResource
    public void grantAdminRight(@PathParam("id") Long id) {
        userManagement.grantAdminRight(id);
    }

    /**
     * ask the user to switch to new hash method on next sign-in.
     *
     * @param id id of the local account
     */
    @PUT
    @Path("{id : [1-9][0-9]*}/SwitchClientHashMethod")
    @AdminResource
    public void switchClientHashMethod(@PathParam("id") Long id) {
        userManagement.switchClientHashMethod(id);
    }

    /**
     * stage new server hash method.
     *
     * @param id id of the local account
     */
    @PUT
    @Path("{id : [1-9][0-9]*}/SwitchServerHashMethod")
    @AdminResource
    public void switchServerHashMethod(@PathParam("id") Long id) {
        userManagement.switchServerHashMethod(id);
    }

}
