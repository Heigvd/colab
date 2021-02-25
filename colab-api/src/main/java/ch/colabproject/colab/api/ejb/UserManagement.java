/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.exceptions.ColabErrorMessage;
import ch.colabproject.colab.api.exceptions.ColabErrorMessage.MessageCode;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.AuthInfo;
import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.HashMethod;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.model.user.SignUpInfo;
import ch.colabproject.colab.api.model.user.User;
import java.util.Arrays;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

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
    private static final int SALT_LENGTH = 64;

    /**
     * Request related logic
     */
    @Inject
    private RequestManager requestManager;

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
     * @return the hash method to use for new accounts
     */
    public HashMethod getDefaultHashMethod() {
        return HashMethod.PBKDF2WithHmacSHA512_65536_64;
    }

    /**
     * Which authentication method and parameters should a user use to authenticate with the
     * localAccount that match the given email address.
     * <p>
     * In case email address is not linked to any account, authentication method with random
     * parameters is returned. Such parameters may be used by clients to create brand new account.
     * This behavior prevents to easy account existence leaks.
     *
     * @param email account identifier
     *
     * @return authentication method to use to authentication as email owner or new random one which
     *         can be use to create a brand new localAccount
     */
    public AuthMethod getAuthenticationMethod(String email) {
        LocalAccount account = this.findLocalAccountByEmail(email);
        if (account != null) {
            return new AuthMethod(account.getCurrentClientHashMethod(), account.getClientSalt(),
                account.getNextClientHashMethod(), account.getNewClientSalt());
        } else {
            AuthMethod authMethod = new AuthMethod(this.getDefaultHashMethod(), Helper
                .generateHexSalt(SALT_LENGTH), null, null);
            // TODO: store it in a tmp cache
            return authMethod;
        }
    }

    /**
     * Create a new user with local account
     *
     * @param signup all info to create a new account
     *
     * @return brand new user embedding an LocalAccount
     *
     * @throws ColabErrorMessage if username is already taken
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
                return user;
            } else {
                // wait.... throwing something else here leaks account existence...
                throw new ColabErrorMessage(MessageCode.USERNAME_ALREADY_TAKEN);
            }

        } else {
            throw new ColabErrorMessage(MessageCode.USERNAME_ALREADY_TAKEN);
        }
    }

    /**
     * Try to authenticate user with given token
     *
     * @param authInfo authentication information
     *
     * @return just authenticated user of null is authentication did not succeed
     *
     * @throws ColabErrorMessage if authentication failed
     */
    public User authenticate(AuthInfo authInfo) {
        String email = authInfo.getEmail();
        LocalAccount account = this.findLocalAccountByEmail(email);

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
                    // case 1: new client-side hash method
                    if (account.getNextClientHashMethod() != null
                        && authInfo.getOptionalHash() != null) {
                        account.setClientSalt(account.getNewClientSalt());
                        account.setNewClientSalt(null);
                        account.setCurrentClientHashMethod(account.getNextClientHashMethod());
                        mandatoryHash = authInfo.getOptionalHash();
                        forceShadow = true;
                    }

                    // should rotate server method ?
                    if (account.getNextDbHashMethod() != null) {
                        account.setCurrentDbHashMethod(account.getNextDbHashMethod());
                        account.setNextDbHashMethod(null);
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
        throw new ColabErrorMessage(MessageCode.AUTHENTICATION_FAILED);
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

}
