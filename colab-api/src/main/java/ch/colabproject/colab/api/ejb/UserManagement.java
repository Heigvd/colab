/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.AuthInfo;
import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.HashMethod;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.model.user.SignUpInfo;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.user.UserDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.Arrays;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
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
public class UserManagement {

    /**
     * Default size of salt in bytes
     */
    private static final int SALT_LENGTH = 32;

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(UserManagement.class);

    /**
     * Request related logic
     */
    @Inject
    private RequestManager requestManager;

    /**
     * some operation on users will create and send tokens
     */
    @Inject
    private TokenFacade tokenFacade;

    /**
     * User persistence
     */
    @Inject
    private UserDao userDao;

    /**
     * To check permission
     */
    @Inject
    private SecurityFacade securityFacade;

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * @return the hash method to use for new accounts
     */
    public HashMethod getDefaultHashMethod() {
        return HashMethod.PBKDF2WithHmacSHA512_65536_64;
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
    }

    /**
     * Get default hash method with random salt
     *
     * @return a hash method and its parameters
     */
    public AuthMethod getDefaultRandomAuthenticationMethod() {
        return new AuthMethod(this.getDefaultHashMethod(), Helper
            .generateHexSalt(SALT_LENGTH), null, null);
    }

    /**
     * Create a brand new user, which can authenticate with a {@link LocalAccount}. First,
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

                account.setCurrentDbHashMethod(getDefaultHashMethod());
                this.shadowHash(account, signup.getHash());

                user = new User();
                user.getAccounts().add((account));
                account.setUser(user);

                user.setUsername(signup.getUsername());
                em.persist(user);
                // new user with a localaccount should verify their e-mail address
                tokenFacade.requestEmailAddressVerification(account, false);
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

                if (Arrays.equals(hash, account.getHashedPassword())) {
                    // authentication succeed
                    /////////////////////////////////

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
            securityFacade.assertCanWrite(account.getUser());
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
            tokenFacade.sendResetPasswordToken(account, true);
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
        securityFacade.assertCanWrite(managedAccount.getUser());

        String currentEmail = managedAccount.getEmail();
        String newEmail = account.getEmail();

        if (newEmail != null && !newEmail.equals(currentEmail)) {
            try {
                managedAccount.setVerified(false);
                managedAccount.setEmail(newEmail);
                // make sure to flush changes to database. It will check index uniqueness
                em.flush();
                tokenFacade.requestEmailAddressVerification(account, false);
            } catch (Exception e) {
                // address already used, do not send any email to this address
                logger.error("Execption", e);
            }
        }

        return managedAccount;
    }
}
