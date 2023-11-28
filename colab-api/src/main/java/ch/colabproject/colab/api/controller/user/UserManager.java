/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.user;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.ValidationManager;
import ch.colabproject.colab.api.controller.team.TeamManager;
import ch.colabproject.colab.api.controller.token.TokenManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.AuthInfo;
import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.HashMethod;
import ch.colabproject.colab.api.model.user.HttpSession;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.model.user.SignUpInfo;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.user.AccountDao;
import ch.colabproject.colab.api.persistence.jpa.user.HttpSessionDao;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import ch.colabproject.colab.api.security.AuthenticationFailure;
import ch.colabproject.colab.api.security.SessionManager;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.MessageI18nKey;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Everything related to user management
 *
 * @author maxence
 */
@LocalBean
@Stateless
public class UserManager {

    /**
     * Default size of salt in bytes
     */
    private static final int SALT_LENGTH = 32;

    /**
     * Max number of failed authentication allowed
     */
    private static final Long AUTHENTICATION_ATTEMPT_MAX = 25L;

    /**
     * Number of second to wait to accept new authentication attempt if max number has been reached
     */
    private static final Long AUTHENTICATION_ATTEMPT_RESET_DELAY_SEC = 60 * 15L; // 15min

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(UserManager.class);

    /**
     * Request related logic
     */
    @Inject
    private RequestManager requestManager;

    /** Session manager to keep trace of authentication attempts */
    @Inject
    private SessionManager sessionManager;

    /**
     * some operation on users will create and send tokens
     */
    @Inject
    private TokenManager tokenManager;

    /**
     * Entity validation management
     */
    @Inject
    private ValidationManager validationManager;

    /** Team specific logic management */
    @Inject
    private TeamManager teamManager;

    /** Account persistence handling */
    @Inject
    private AccountDao accountDao;

    /** User persistence handling */
    @Inject
    private UserDao userDao;

    /** Http session persistence handling */
    @Inject
    private HttpSessionDao httpSessionDao;

    // *********************************************************************************************
    // find user
    // *********************************************************************************************

    /**
     * Retrieve the user. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param userId the id of the user
     *
     * @return the user if found
     *
     * @throws HttpErrorMessage if the user was not found
     */
    public User assertAndGetUser(Long userId) {
        User user = userDao.findUser(userId);

        if (user == null) {
            logger.error("user #{} not found", userId);
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_NOT_FOUND);
        }

        return user;
    }

    /**
     * Find a user by id
     *
     * @param id id of the user
     *
     * @return the user or null if user not exist or current user has not right to read the user
     */
    public User getUserById(Long id) {
        return userDao.findUser(id);
    }

    /**
     * Get the users related to the given project
     *
     * @param projectId the id of the project
     *
     * @return users list
     */
    public List<User> getUsersForProject(Long projectId) {
        logger.debug("Get users of project #{}", projectId);

        return teamManager.getUsersForProject(projectId);
    }

    /**
     * Which authentication method and parameters should a user use to authenticate. If the
     * identifier is an email address, it will return authMethod which match the localAccount linked
     * with the email address. Otherwise, identifier is used as a username and the first
     * LocalAccount of the user is used.
     * <p>
     * In case no LocalAccount has been found, authentication method with random parameters is
     * returned. Such parameters may be used by clients to create brand-new account. This behavior
     * prevents to easy account existence leaks.
     *
     * @param identifier {@link LocalAccount } email address or {@link User} username
     *
     * @return authentication method to use to authentication as email owner or new random one which
     *         can be used to create a brand new localAccount
     *
     * @throws HttpErrorMessage badRequest if there is no identifier
     */
    public AuthMethod getAuthenticationMethod(String identifier) {
        try {
            return requestManager.sudo(() -> {
                if (identifier == null || identifier.isBlank()) {
                    throw HttpErrorMessage.badRequest();
                } else {
                    LocalAccount account = findLocalAccountByIdentifier(identifier);

                    if (account != null) {
                        return new AuthMethod(account.getCurrentClientHashMethod(),
                                account.getClientSalt(),
                                account.getNextClientHashMethod(), account.getNewClientSalt());
                    } else {
                        // no account found, return random method
                        // TODO: store it in a tmp cache
                        return this.getDefaultRandomAuthenticationMethod();
                    }
                }
            });
        } catch (Exception e) {
            return this.getDefaultRandomAuthenticationMethod();
        }
    }

    /**
     * Get default hash method with random salt
     *
     * @return a hash method and its parameters
     */
    public AuthMethod getDefaultRandomAuthenticationMethod() {
        return new AuthMethod(Helper.getDefaultHashMethod(), Helper
                .generateHexSalt(SALT_LENGTH), null, null);
    }

    /**
     * {@link #createAdminUser(String, String, String)} within a brand-new transaction.
     *
     * @param username      username
     * @param email         email address
     * @param plainPassword plain text password
     *
     * @return a brand-new user to rule them all
     */
    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public User createAdminUserTx(String username, String email, String plainPassword) {
        return this.createAdminUser(username, email, plainPassword);
    }

    /**
     * Create a brand-new admin user, which can authenticate with a {@link LocalAccount}.
     * <p>
     * First create the user and the local account, then authenticate and grant admin rights.
     *
     * @param username      username
     * @param email         email address
     * @param plainPassword plain text password
     *
     * @return a brand-new user to rule them all
     *
     * @throws HttpErrorMessage if username is already taken
     */
    private User createAdminUser(String username, String email, String plainPassword) {
        User admin = this.createUserWithLocalAccount(username, username /* username is also used as firstname */, email, plainPassword);

        LocalAccount account = (LocalAccount) admin.getAccounts().get(0);

        AuthInfo authInfo = new AuthInfo();
        authInfo.setIdentifier(username);
        authInfo.setMandatoryHash(
                Helper.bytesToHex(
                        account.getCurrentClientHashMethod().hash(
                                plainPassword,
                                account.getClientSalt())));
        this.authenticate(authInfo);

        this.grantAdminRight(admin.getId());
        return admin;
    }

    /**
     * Create a brand-new user, which can authenticate with a {@link LocalAccount}.First,
     * plainPassword will be hashed as any client should do. Then the
     * {@link #signup(SignUpInfo) signup} method is called.
     *
     * @param username      username
     * @param firstname     first name
     * @param email         email address
     * @param plainPassword plain text password
     *
     * @return a brand-new user
     *
     * @throws HttpErrorMessage if username is already taken
     */
    private User createUserWithLocalAccount(String username, String firstname, String email, String plainPassword) {
        AuthMethod method = getDefaultRandomAuthenticationMethod();
        byte[] hash = method.getMandatoryMethod().hash(plainPassword, method.getSalt());

        SignUpInfo signUpInfo = new SignUpInfo();

        signUpInfo.setUsername(username);
        signUpInfo.setFirstname(firstname);
        signUpInfo.setEmail(email);
        signUpInfo.setHashMethod(method.getMandatoryMethod());
        signUpInfo.setSalt(method.getSalt());
        signUpInfo.setHash(Helper.bytesToHex(hash));

        return this.signup(signUpInfo);
    }

    /**
     * Create a new user with local account. An e-mail will be sent to user to verify its account
     *
     * @param signup all info to create a new account
     *
     * @return brand-new user embedding an LocalAccount
     *
     * @throws HttpErrorMessage if username is already taken
     */
    public User signup(SignUpInfo signup) {
        // username already taken ?
        User user = userDao.findUserByUsername(signup.getUsername());
        if (user == null) {
            // username not yet taken
            LocalAccount account = accountDao.findLocalAccountByEmail(signup.getEmail());
            // no local account with the given email address

            if (account == null) {
                if (!Helper.isEmailAddress(signup.getEmail())) {
                    throw HttpErrorMessage.signUpFailed(MessageI18nKey.EMAIL_NOT_VALID);
                }

                account = new LocalAccount();
                account.setClientSalt(signup.getSalt());
                account.setCurrentClientHashMethod(signup.getHashMethod());
                account.setEmail(signup.getEmail());
                account.setVerified(false);

                account.setCurrentDbHashMethod(Helper.getDefaultHashMethod());
                this.shadowHash(account, signup.getHash());

                user = new User();
                user.getAccounts().add((account));
                account.setUser(user);

                user.setUsername(signup.getUsername());
                user.setFirstname(signup.getFirstname());
                user.setLastname(signup.getLastname());
                user.setAffiliation(signup.getAffiliation());
                user.setAgreedTime(OffsetDateTime.now());

                validationManager.assertValid(user);
                validationManager.assertValid(account);

                User persistedUser = userDao.persistUser(user);
                // flush changes to DB to check DB constraint
                // TODO: build some AfterTXCommit executor
                requestManager.flush();
                // new user with a local account should verify their e-mail address
                tokenManager.requestEmailAddressVerification(account, false);
                return persistedUser;
            } else {
                // wait.... throwing something else here leaks account existence...
                // for security reason, give as little useful information as possible
                // the user is not allowed to know if the error concerns the username or the email
                // address
                throw HttpErrorMessage.signUpFailed(MessageI18nKey.IDENTIFIER_ALREADY_TAKEN);
            }

        } else {
            // for security reason, give as little useful information as possible
            // the user is not allowed to know if the error concerns the username or the email
            // address
            throw HttpErrorMessage.signUpFailed(MessageI18nKey.IDENTIFIER_ALREADY_TAKEN);
        }
    }

    /**
     * Try to authenticate user with given token
     *
     * @param authInfo authentication information
     *
     * @return just authenticated user of null is authentication did not succeed
     *
     * @throws HttpErrorMessage if authentication failed
     */
    public User authenticate(AuthInfo authInfo) {
        LocalAccount account = findLocalAccountByIdentifier(authInfo.getIdentifier());

        if (account != null) {
            HashMethod m = account.getCurrentDbHashMethod();
            String mandatoryHash = authInfo.getMandatoryHash();

            if (mandatoryHash != null) {
                byte[] hash = m.hash(mandatoryHash, account.getDbSalt());

                AuthenticationFailure aa = sessionManager.getAuthenticationAttempt(account);
                if (aa != null) {
                    logger.warn("Attempt: {}", aa.getCounter());
                    if (aa.getCounter() >= AUTHENTICATION_ATTEMPT_MAX) {
                        // max number of failed attempts reached
                        OffsetDateTime lastAttempt = aa.getTimestamp();
                        OffsetDateTime delay = lastAttempt
                                .plusSeconds(AUTHENTICATION_ATTEMPT_RESET_DELAY_SEC);
                        if (OffsetDateTime.now().isAfter(delay)) {
                            // delay has been reached, user may try again
                            sessionManager.resetAuthenticationAttemptHistory(account);
                        } else {
                            // user have to wait some time before any new attempt
                            logger.warn(
                                    "Account {} reached the max number of failed authentication",
                                    account);
                            throw HttpErrorMessage.tooManyAttempts();
                        }
                    }
                }

                // Spotbugs reports a timing attack vulnerability using:
                // if (Arrays.equals(hash, account.getHashedPassword())) {
                // doing a full comparison of arrays makes it happy:
                if (Helper.constantTimeArrayEquals(hash, account.getHashedPassword())) {
                    // authentication succeed
                    /////////////////////////////////
                    sessionManager.resetAuthenticationAttemptHistory(account);

                    boolean forceShadow = false;

                    // should rotate client method ?
                    if (account.getNextClientHashMethod() != null
                            && authInfo.getOptionalHash() != null) {
                        // rotate method
                        account.setClientSalt(account.getNewClientSalt());
                        account.setNewClientSalt(null);
                        account.setCurrentClientHashMethod(account.getNextClientHashMethod());
                        account.setNextClientHashMethod(null);

                        // rotate provided hash and force to compute and save db hash
                        mandatoryHash = authInfo.getOptionalHash();
                        forceShadow = true;
                    }

                    // should rotate server method ?
                    if (account.getNextDbHashMethod() != null) {
                        // rotate method
                        account.setCurrentDbHashMethod(account.getNextDbHashMethod());
                        account.setNextDbHashMethod(null);
                        // force to compute and save db hash
                        forceShadow = true;
                    }

                    if (forceShadow) {
                        this.shadowHash(account, mandatoryHash);
                    }

                    requestManager.login(account);

                    return account.getUser();
                } else {
                    // update cache of failed authentication attempt
                    sessionManager.authenticationFailure(account);
                }
            }
        }

        // authentication fails
        // OR client did not provide required hash
        // OR account not found
        throw HttpErrorMessage.authenticationFailed();
    }

    /**
     * Update password of the given account. The given password should be hashed by the client
     *
     * @param authInfo contains account identifier and new password
     *
     * @throws HttpErrorMessage if currentUser is not allowed to update the given account
     */
    public void updatePassword(AuthInfo authInfo) {
        LocalAccount account = findLocalAccountByIdentifier(authInfo.getIdentifier());

        if (account != null) {
            String mandatoryHash = authInfo.getMandatoryHash();

            if (mandatoryHash != null) {

                // should rotate server method ?
                if (account.getNextDbHashMethod() != null) {
                    // rotate method
                    account.setCurrentDbHashMethod(account.getNextDbHashMethod());
                    account.setNextDbHashMethod(null);
                    // force to compute and save db hash
                }

                this.shadowHash(account, mandatoryHash);
                return;
            }
        }

        throw HttpErrorMessage.forbidden();
    }

    /**
     * hash given client-side hash to dbHash and store it
     *
     * @param account  account to update the hash in
     * @param hash hash (ie account.clientMethod.hash(clientSalt + plain_password))
     */
    private void shadowHash(LocalAccount account, String hash) {
        // use a new salt
        account.setDbSalt(Helper.generateSalt(SALT_LENGTH));
        // compute new hash and save it
        byte[] newHash = account.getCurrentDbHashMethod().hash(hash, account.getDbSalt());
        account.setHashedPassword(newHash);
    }

    /**
     * Log current user out
     */
    public void logout() {
        // clear account from http session
        this.requestManager.logout();
    }

    /**
     * Force session logout
     *
     * @param sessionId id of session to logout
     */
    public void forceLogout(Long sessionId) {
        HttpSession httpSession = httpSessionDao.findHttpSession(sessionId);
        HttpSession currentSession = requestManager.getHttpSession();
        if (httpSession != null) {
            if (!httpSession.equals(currentSession)) {
                requestManager.sudo(() -> sessionManager.deleteHttpSession(httpSession));
            } else {
                throw HttpErrorMessage.badRequest();
            }
        }
    }

    /**
     * Grant admin right to a user.
     *
     * @param user user who will become an admin
     */
    public void grantAdminRight(User user) {
        user.setAdmin(true);
    }

    /**
     * Grant admin right to a user.
     *
     * @param id id of user who will become an admin
     */
    public void grantAdminRight(Long id) {
        this.grantAdminRight(userDao.findUser(id));
    }

    /**
     * Revoke admin right to a user.
     *
     * @param id id of user who will not be an admin any longer
     */
    public void revokeAdminRight(Long id) {
        this.revokeAdminRight(userDao.findUser(id));
    }

    /**
     * revoke admin right to a user.
     *
     * @param user user who will not be an admin any longer
     */
    public void revokeAdminRight(User user) {
        if (user != null) {
            User currentUser = requestManager.getCurrentUser();
            if (user.equals(currentUser)) {
                // user shall not remove admin right to itself
                throw HttpErrorMessage.badRequest();
            } else {
                user.setAdmin(false);
            }
        }
    }

    /**
     * Setup new client hash method to use for the given local account
     *
     * @param id id of the LocalAccount
     */
    public void switchClientHashMethod(Long id) {
        Account account = accountDao.findAccount(id);
        if (account instanceof LocalAccount) {
            LocalAccount localAccount = (LocalAccount) account;
            AuthMethod authMethod = getDefaultRandomAuthenticationMethod();
            localAccount.setNextClientHashMethod(authMethod.getMandatoryMethod());
            localAccount.setNewClientSalt(authMethod.getSalt());
        }
    }

    /**
     * Setup new server hash method to use for the given local account
     *
     * @param id id of the LocalAccount
     */
    public void switchServerHashMethod(Long id) {
        Account account = accountDao.findAccount(id);
        if (account instanceof LocalAccount) {
            LocalAccount localAccount = (LocalAccount) account;
            AuthMethod authMethod = getDefaultRandomAuthenticationMethod();
            localAccount.setNextDbHashMethod(authMethod.getMandatoryMethod());
        }
    }

    /**
     * Find local account by identifier.
     *
     * @param identifier email address or username
     *
     * @return LocalAccount
     */
    public LocalAccount findLocalAccountByIdentifier(String identifier) {
        LocalAccount account = accountDao.findLocalAccountByEmail(identifier);

        if (account == null) {
            // no localAccount with such an email address
            // try to find a user by username
            User user = userDao.findUserByUsername(identifier);
            if (user != null) {
                // User found, as authenticationMethod is only available for LocalAccount,
                // try to find one
                Optional<Account> optAccount = user.getAccounts().stream()
                        .filter(a -> a instanceof LocalAccount)
                        .findFirst();
                if (optAccount.isPresent()) {
                    account = (LocalAccount) optAccount.get();
                }
            }
        }
        return account;
    }

    /**
     * If the given email address is linked to a local account, sent a link to this mailbox to reset
     * the account password.
     *
     * @param email email address used as account identifier
     */
    public void requestPasswordReset(String email) {
        logger.debug("Request reset password: {}", email);
        LocalAccount account = accountDao.findLocalAccountByEmail(email);
        if (account != null) {
            // account exists, send the message
            tokenManager.sendResetPasswordToken(account, true);
        }
    }

    /**
     * Update the account with values provided in given account.Only field which are editable by
     * users will be impacted.
     *
     * @param account account new values
     *
     * @return updated account
     *
     * @throws HttpErrorMessage    if the provided email is not a valid email
     * @throws ColabMergeException if something went wrong
     */
    public LocalAccount updateLocalAccountEmailAddress(LocalAccount account)
            throws ColabMergeException {
        logger.debug("Update LocalAccount email address: {}", account);
        LocalAccount managedAccount = (LocalAccount) accountDao.findAccount(account.getId());

        String currentEmail = managedAccount.getEmail();
        String newEmail = account.getEmail();

        if (newEmail != null && !newEmail.equals(currentEmail)) {
            if (!Helper.isEmailAddress(newEmail)) {
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }

            try {
                managedAccount.setVerified(false);
                managedAccount.setEmail(newEmail);
                // make sure to flush changes to database. It will check index uniqueness
                requestManager.flush();
                tokenManager.requestEmailAddressVerification(account, false);
            } catch (Exception e) {
                // address already used, do not send any email to this address
                logger.error("Exception", e);
            }
        }

        return managedAccount;
    }

    /**
     * Set the account as verified
     *
     * @param account the account to change
     */
    public void setLocalAccountAsVerified(LocalAccount account) {
        account.setVerified(Boolean.TRUE);
    }

    /**
     * Update the user agreedTime to now
     *
     * @param user the user to update
     */
    public void updateUserAgreedTime(User user) {
        OffsetDateTime now = OffsetDateTime.now();
        user.setAgreedTime(now);
    }

    /**
     * Get all session linked to the current user
     *
     * @return list of all active sessions
     */
    public List<HttpSession> getCurrentUserActiveHttpSessions() {
        return requestManager.getCurrentUser().getAccounts().stream()
                .flatMap(account -> account.getHttpSessions().stream()).collect(Collectors.toList());
    }
}
