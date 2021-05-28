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
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.AuthInfo;
import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.model.user.SignUpInfo;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.user.UserDao;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * User controller
 *
 * @author maxence
 */
@Path("users")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class UserEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(UserEndpoint.class);

    /**
     * Users related business logic
     */
    @Inject
    private UserManagement userManagement;

    /**
     * User persistence
     */
    @Inject
    private UserDao userDao;

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
        logger.debug("get auth method for {}", identifier);
        return userManagement.getAuthenticationMethod(identifier);
    }

    /**
     * Get all users
     *
     * @return list of all users
     */
    @GET
    @AdminResource
    public List<User> getAllUsers() {
        logger.debug("get all users");
        return userDao.getAllUsers();
    }

    /**
     * Return the current authenticated user.
     *
     * @param id id of the user
     *
     * @return user which match the given id or null
     */
    @GET
    @Path("{id : [0-9]*}")
    public User getUserById(@PathParam("id") Long id) {
        logger.debug("get user #{}", id);
        return userManagement.getUserById(id);
    }

    /**
     * Return the current authenticated user.
     *
     * @return current user or null
     */
    @GET
    @Path("CurrentUser")
    public User getCurrentUser() {
        logger.debug("get current user");
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
        logger.debug("get current account");
        return requestManager.getCurrentAccount();
    }

    /**
     * Get all accounts owned by the current user
     *
     * @return list of accounts
     */
    @GET
    @Path("AllCurrentUserAccount")
    public List<Account> getAllCurrentUserAccounts() {
        logger.debug("get all accounts of current user");
        User user = requestManager.getCurrentUser();
        if (user != null) {
            return user.getAccounts();
        } else {
            return List.of();
        }
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
        logger.debug("sign-up {}", signup);
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
        logger.debug("sign-in {}", authInfo);
        userManagement.authenticate(authInfo);
    }

    /**
     * Sign out.
     */
    @POST
    @Path("SignOut")
    public void signOut() {
        logger.debug("sign-out");
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
        logger.debug("update user profile: {}", user);
        securityFacade.assertCanWrite(user);
        userDao.updateUser(user);
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
        logger.debug("Grant admin right to user #{}", id);
        userManagement.grantAdminRight(id);
    }

    /**
     *  remove admin right to user identified by given id.
     *
     * @param id id of the user
     */
    @DELETE
    @Path("{id : [1-9][0-9]*}/GrantAdminRight")
    @AdminResource
    public void revokeAdminRight(@PathParam("id") Long id) {
        logger.debug("Grant admin right to user #{}", id);
        userManagement.revokeAdminRight(id);
    }

    /**
     * Update password of a localAccount. The password MUST be hasehd a first time by the client.
     * <p>
     * @param authInfo identifier and new password
     *
     * @throws HttpErrorMessage if currentUser is not allowed to update the given account
     */
    @PUT
    @Path("/UpdatePassword")
    public void updateLocalAccountPassword(AuthInfo authInfo) {
        logger.debug("Update local account \"{}\" password", authInfo.getIdentifier());
        userManagement.updatePassword(authInfo);
    }

    /**
     * Request a local account password reset. This method always returns 204 no content
     * <p>
     * @param email email address of account
     *
     */
    @PUT
    @Path("/RequestPasswordReset/{email}")
    public void requestPasswordReset(@PathParam("email") String email) {
        logger.debug("Request password reset token {}", email);
        userManagement.requestPasswordReset(email);
    }

    /**
     * Update local account
     *
     * @param account local account with new email address inside
     *
     * @throws ColabMergeException if update fails
     */
    @PUT
    @Path("/ChangeEmail")
    @AuthenticationRequired
    public void updateLocalAccountEmailAddress(LocalAccount account) throws ColabMergeException {
        logger.debug("Update local account email address: {}", account);
        userManagement.updateLocalAccountEmailAddress(account);
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
        logger.debug("Switch client hash method for account #{}", id);
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
        logger.debug("Switch server hash method for account #{}", id);
        userManagement.switchServerHashMethod(id);
    }

}
