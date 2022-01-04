/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.user;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.token.TokenManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.AuthInfo;
import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.HashMethod;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.model.user.SignUpInfo;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.user.UserDao;
import ch.colabproject.colab.api.security.AuthenticationFailure;
import ch.colabproject.colab.api.security.SessionManager;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.time.OffsetDateTime;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import liquibase.pro.packaged.ch;
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
    private static final Long AUTHENTICATION_ATTEMPT_MAX = 25l;

    /**
     * Number of second to wait to accept new authentication attempt if max number has been reached
     */
    private static final Long AUTHENTICATION_ATTEMPT_RESET_DELAY_SEC = 60*15l; // 15min

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
     * User persistence
     */
    @Inject
    private UserDao userDao;

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find a user by id
     *
     * @param id id of the user
     *
     * @return the user or null if user not exist or current user has not right to read the user
     */
    public User getUserById(Long id) {
        User user = userDao.findUser(id);
        return user;
    }

    /**
     * Which authentication method and parameters should a user use to authenticate. If the
     * identifier is an email address, it will return authMethod which match the localAccount linked
     * with the email address. Otherwise, identifier is used as a username and the first
     * LocalAccount of the user is used.
     * <p>
     * In case no LocalAccount has been found, authentication method with random parameters is
     * returned. Such parameters may be used by clients to create brand new account. This behavior
     * prevents to easy account existence leaks.
     *
     * @param identifier {@link LocalAccount } email address or {@link User} username
     *
     * @return authentication method to use to authentication as email owner or new random one which
     *         can be use to create a brand new localAccount
     *
     * @throws HttpErrorMessage badRequest if there is no identifier
     */
    public AuthMethod getAuthenticationMethod(String identifier) {
        try {
            return requestManager.sudo(() -> {
                if (identifier == null || identifier.isBlank()) {
                    throw HttpErrorMessage.badRequest();
                } else {
                    LocalAccount account = userDao.findLocalAccountByIdentifier(identifier);

                    if (account != null) {
                        return new AuthMethod(account.getCurrentClientHashMethod(), account.getClientSalt(),
                            account.getNextClientHashMethod(), account.getNewClientSalt());
                    } else {
                        // no account found, reeturn random method
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
     * Create a brand new user, which can authenticate with a {@link LocalAccount}.First,
     * plainPassword will be hashed as any client should do. Then the
     * {@link #signup(ch.colabproject.colab.api.model.user.SignUpInfo)  signup} method is called.
     *
     * @param username      username
     * @param email         email address
     * @param plainPassword plain text password
     *
     * @return a brand new user
     *
     * @throws HttpErrorMessage if username is already taken
     */
    public User createUser(String username, String email, String plainPassword) {
        AuthMethod method = getDefaultRandomAuthenticationMethod();
        SignUpInfo signUpinfo = new SignUpInfo();

        signUpinfo.setUsername(username);
        signUpinfo.setEmail(email);
        signUpinfo.setHashMethod(method.getMandatoryMethod());

        signUpinfo.setSalt(method.getSalt());

        byte[] hash = method.getMandatoryMethod().hash(plainPassword, method.getSalt());

        signUpinfo.setHash(Helper.bytesToHex(hash));

        return this.signup(signUpinfo);
    }

    /**
     * {@link #createAdminUser(java.lang.String, java.lang.String, java.lang.String)
     * createAdminUser} within a brand new transaction.
     *
     * @param username      username
     * @param email         email address
     * @param plainPassword plain text password
     *
     * @return a brand new user
     *
     */
    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public User createAdminUserTx(String username, String email, String plainPassword) {
        return this.createAdminUser(username, email, plainPassword);
    }

    /**
     * Create a brand new admin user, which can authenticate with a {@link LocalAccount}. First,
     * plainPassword will be hashed as any client should do. Then the
     * {@link #signup(ch.colabproject.colab.api.model.user.SignUpInfo)  signup} method is called.
     *
     * @param username      username
     * @param email         email address
     * @param plainPassword plain text password
     *
     * @return a brand new user
     *
     * @throws HttpErrorMessage if username is already taken
     */
    public User createAdminUser(String username, String email, String plainPassword) {
        User admin = this.createUser(username, email, plainPassword);
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
     * Create a new user with local account. An e-mail will be sent to user to verify its account
     *
     * @param signup all info to create a new account
     *
     * @return brand new user embedding an LocalAccount
     *
     * @throws HttpErrorMessage if username is already taken
     */
    public User signup(SignUpInfo signup) {
        // username already taken ?
        User user = userDao.findUserByUsername(signup.getUsername());
        if (user == null) {
            // username not yet taken
            LocalAccount account = userDao.findLocalAccountByEmail(signup.getEmail());
            // no local account with the given email address

            if (account == null) {
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
                em.persist(user);
                // flush changes to DB to check DB constraint
                // TODO: build some AfterTXCommit executor
                em.flush();
                // new user with a localaccount should verify their e-mail address
                tokenManager.requestEmailAddressVerification(account, false);
                return user;
            } else {
                // wait.... throwing something else here leaks account existence...
                throw HttpErrorMessage.userNameAlreadyTaken();
            }

        } else {
            throw HttpErrorMessage.userNameAlreadyTaken();
        }
    }

    /**
     * Make a full comparison of array. Do not return false as soon as array. Prevent timing-attack.
     *
     * @param a first array
     * @param b second array
     *
     * @return array equals or not
     */
    private boolean constantTimeArrayEquals(byte[] a, byte[] b) {
        boolean result = true;
        int aSize = a.length;
        int bSize = b.length;
        int max = Math.max(aSize, bSize);
        for (int i = 0; i < max; i++) {
            if (i >= aSize || i >= bSize) {
                result = false;
            } else {
                result = a[i] == b[i] && result;
            }
        }
        return result;
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
        LocalAccount account = userDao.findLocalAccountByIdentifier(authInfo.getIdentifier());

        if (account != null) {
            HashMethod m = account.getCurrentDbHashMethod();
            String mandatoryHash = authInfo.getMandatoryHash();

            if (mandatoryHash != null) {
                byte[] hash = m.hash(mandatoryHash, account.getDbSalt());

                AuthenticationFailure aa = sessionManager.getAuthenticationAttempt(account);
                if (aa != null) {
                    logger.warn("Attmpt: {}", aa.getCounter());
                    if (aa.getCounter() >= AUTHENTICATION_ATTEMPT_MAX) {
                        // max number of failed attempts reached
                        OffsetDateTime lastAttempt = aa.getTimestamp();
                        OffsetDateTime delay = lastAttempt.plusSeconds(AUTHENTICATION_ATTEMPT_RESET_DELAY_SEC);
                        if (OffsetDateTime.now().isAfter(delay)) {
                            // delay has been reached, user may try again
                            sessionManager.resetAuthenticationAttemptHistory(account);
                        } else {
                            // user have to wait some time before any new attempt
                            logger.warn("Account {} reached the max number of failed authentication", account);
                            throw HttpErrorMessage.tooManyRequest();
                        }
                    }
                }

                // Spotbugs reports a timing attack vulnerability using:
                //  if (Arrays.equals(hash, account.getHashedPassword())) {
                // doing a fullcomparison of arrays makes it happy:
                if (this.constantTimeArrayEquals(hash, account.getHashedPassword())) {
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
        LocalAccount account = userDao.findLocalAccountByIdentifier(authInfo.getIdentifier());

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
     * @param password hash (ie account.clientMethod.hash(clientSalt + plain_password))
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
     * Grant admin right to a user.
     *
     * @param user user who will became an admin
     */
    public void grantAdminRight(User user) {
        user.setAdmin(true);
    }

    /**
     * Grant admin right to a user.
     *
     * @param id id of user who will became an admin
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
        Account account = userDao.findAccount(id);
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
        Account account = userDao.findAccount(id);
        if (account instanceof LocalAccount) {
            LocalAccount localAccount = (LocalAccount) account;
            AuthMethod authMethod = getDefaultRandomAuthenticationMethod();
            localAccount.setNextDbHashMethod(authMethod.getMandatoryMethod());
        }
    }

    /**
     * If the given email address is linked to a localaccount, sent a link to this mailbox to reset
     * the account password.
     *
     * @param email email address used as account identifier
     */
    public void requestPasswordReset(String email) {
        logger.debug("Request reset password: {}", email);
        LocalAccount account = userDao.findLocalAccountByEmail(email);
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
     * @throws ColabMergeException if something went wrong
     */
    public LocalAccount updateLocalAccountEmailAddress(LocalAccount account)
        throws ColabMergeException {
        logger.debug("Update LocalAccount email address: {}", account);
        LocalAccount managedAccount = (LocalAccount) userDao.findAccount(account.getId());

        String currentEmail = managedAccount.getEmail();
        String newEmail = account.getEmail();

        if (newEmail != null && !newEmail.equals(currentEmail)) {
            try {
                managedAccount.setVerified(false);
                managedAccount.setEmail(newEmail);
                // make sure to flush changes to database. It will check index uniqueness
                em.flush();
                tokenManager.requestEmailAddressVerification(account, false);
            } catch (Exception e) {
                // address already used, do not send any email to this address
                logger.error("Execption", e);
            }
        }

        return managedAccount;
    }
}
