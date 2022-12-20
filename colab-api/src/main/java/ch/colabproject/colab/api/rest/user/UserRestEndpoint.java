/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.user;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.user.UserManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.AuthInfo;
import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.HttpSession;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.model.user.SignUpInfo;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
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
public class UserRestEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(UserRestEndpoint.class);

    /**
     * Users related business logic
     */
    @Inject
    private UserManager userManager;

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
     * Get the authentication method and its parameters a user shall use to authenticate with the
     * given email address.
     *
     * @param identifier email address or username the user want to sign in with
     *
     * @return Authentication method to user
     */
    @GET
    @Path("AuthMethod/{identifier : [^/]*}")
    public AuthMethod getAuthMethod(@PathParam("identifier") String identifier) {
        logger.debug("get auth method for {}", identifier);
        return userManager.getAuthenticationMethod(identifier);
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
        return userDao.findAllUsers();
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
    @AuthenticationRequired
    public User getUserById(@PathParam("id") Long id) {
        logger.debug("get user #{}", id);
        return userManager.getUserById(id);
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
        userManager.signup(signup);
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
        userManager.authenticate(authInfo);
    }

    /**
     * Sign out.
     */
    @POST
    @Path("SignOut")
    public void signOut() {
        logger.debug("sign-out");
        userManager.logout();
    }

    /**
     * Get all active session for the current user
     *
     * @return list of active session linked to the current user
     */
    @GET
    @Path("Sessions")
    @AuthenticationRequired
    public List<HttpSession> getActiveSessions() {
        return userManager.getCurrentUserActiveSessions();
    }

    /**
     * Force session logout
     *
     * @param sessionId if of the HTTP session to delete
     */
    @DELETE
    @Path("Session/{id}")
    @AuthenticationRequired
    public void forceLogout(@PathParam("id") Long sessionId) {
        userManager.forceLogout(sessionId);
    }

    /**
     * Update user. Only fields which are editable by users will be impacted..
     *
     * @param user user to update
     *
     * @throws ColabMergeException if update fails
     */
    @PUT
    @AuthenticationRequired
    public void updateUser(User user) throws ColabMergeException {
        logger.debug("update user profile: {}", user);
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
        userManager.grantAdminRight(id);
    }

    /**
     * remove admin right to user identified by given id.
     *
     * @param id id of the user
     */
    @DELETE
    @Path("{id : [1-9][0-9]*}/GrantAdminRight")
    @AdminResource
    public void revokeAdminRight(@PathParam("id") Long id) {
        logger.debug("Grant admin right to user #{}", id);
        userManager.revokeAdminRight(id);
    }

    /**
     * Update password of a localAccount. The password MUST be hashed a first time by the client.
     * <p>
     * @param authInfo identifier and new password
     *
     * @throws HttpErrorMessage if currentUser is not allowed to update the given account
     */
    @PUT
    @Path("/UpdatePassword")
    public void updateLocalAccountPassword(AuthInfo authInfo) {
        logger.debug("Update local account \"{}\" password", authInfo.getIdentifier());
        userManager.updatePassword(authInfo);
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
        userManager.requestPasswordReset(email);
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
        userManager.updateLocalAccountEmailAddress(account);
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
        userManager.switchClientHashMethod(id);
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
        userManager.switchServerHashMethod(id);
    }

}
