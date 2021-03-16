/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.AuthInfo;
import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.HashMethod;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.model.user.SignUpInfo;
import ch.colabproject.colab.api.model.user.User;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import liquibase.pro.packaged.ch;

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

    /**
     * Request related logic
     */
    @Inject
    private RequestManager requestManager;

    /**
     * some operation on users will create and send tokens
     */
    @Inject
    private TokenDao tokenDao;

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find an account by Id.
     *
     * @param accountId id of the account to look for
     *
     * @return the account if it exsits; null otherwise
     */
    public Account findAccount(Long accountId) {
        try {
            return em.find(Account.class, accountId);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    /**
     * Return the LocalAccount which match the given email address.
     *
     * @param email email address to search
     *
     * @return the matching LocalAccount or null
     */
    public LocalAccount findLocalAccountByEmail(String email) {
        try {
            TypedQuery<LocalAccount> query
                = em.createNamedQuery("LocalAccount.findByEmail", LocalAccount.class);
            query.setParameter("email", email);
            return query.getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    /**
     * Find a user by id
     *
     * @param userId is of the user to search
     *
     * @return the user or null
     */
    public User findUser(Long userId) {
        try {
            return em.find(User.class, userId);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    /**
     * Find a user by username
     *
     * @param username needle
     *
     * @return the user which matching username or null if it not exists
     */
    public User findUserByUsername(String username) {
        try {
            TypedQuery<User> query
                = em.createNamedQuery("User.findByUsername", User.class);
            query.setParameter("username", username);

            return query.getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    /**
     * Retrieve the list of all admin user from database
     *
     * @return list of all administrator
     */
    public List<User> findAllAdmin() {
        TypedQuery<User> query = em.createNamedQuery("User.findAllAdmin", User.class);
        return query.getResultList();
    }

    /**
     * @return the hash method to use for new accounts
     */
    public HashMethod getDefaultHashMethod() {
        return HashMethod.PBKDF2WithHmacSHA512_65536_64;
    }

    /**
     * Find local account by identifier.
     *
     * @param identifier email address or username
     *
     * @return LocalAccount
     */
    private LocalAccount findLocalAccountByIdentifier(String identifier) {
        LocalAccount account = this.findLocalAccountByEmail(identifier);

        if (account == null) {
            // no localAccount with such an email addres
            // try to find a user by username
            User user = this.findUserByUsername(identifier);
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
            LocalAccount account = this.findLocalAccountByIdentifier(identifier);

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
        User user = this.findUserByUsername(signup.getUsername());
        if (user == null) {
            // username not yet taken
            LocalAccount account = this.findLocalAccountByEmail(signup.getEmail());
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
                tokenDao.requestEmailAddressVerification(account, false);
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
        LocalAccount account = this.findLocalAccountByIdentifier(authInfo.getIdentifier());

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

                    requestManager.getHttpSession().setAccountId(account.getId());

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
        this.requestManager.getHttpSession().setAccountId(null);
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
        this.grantAdminRight(this.findUser(id));
    }

    /**
     * Update the user with values provided in given user. Only field which are editable by users
     * will be impacted.
     *
     * @param user object which contains id and new values
     *
     * @throws ColabMergeException if something went wrong
     */
    public void updateUser(User user) throws ColabMergeException {
        User managedUser = this.findUser(user.getId());

        managedUser.merge(user);
    }

    /**
     * Setup new client hash method to use for the given local account
     *
     * @param id id of the LocalAccount
     */
    public void switchClientHashMethod(Long id) {
        Account account = this.findAccount(id);
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
        Account account = this.findAccount(id);
        if (account instanceof LocalAccount) {
            LocalAccount localAccount = (LocalAccount) account;
            AuthMethod authMethod = getDefaultRandomAuthenticationMethod();
            localAccount.setNextDbHashMethod(authMethod.getMandatoryMethod());
        }
    }
}
