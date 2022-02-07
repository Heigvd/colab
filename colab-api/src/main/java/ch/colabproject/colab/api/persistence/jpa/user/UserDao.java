/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.user;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.model.user.HttpSession;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Users persistence
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class UserDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(UserDao.class);

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
     * @return the account if it exists; null otherwise
     */
    public Account findAccount(Long accountId) {
        if (accountId != null) {
            try {
                return em.find(Account.class, accountId);
            } catch (IllegalArgumentException ex) {
                return null;
            }
        } else {
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
     * Get the list of all users
     *
     * @return list of all users
     */
    public List<User> getAllUsers() {
        TypedQuery<User> query = em.createNamedQuery("User.findAll", User.class);
        return query.getResultList();
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
     * Find local account by identifier.
     *
     * @param identifier email address or username
     *
     * @return LocalAccount
     */
    public LocalAccount findLocalAccountByIdentifier(String identifier) {
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
     * Find a persisted HttpSession by id
     *
     * @param id id
     *
     * @return the session or null
     */
    public HttpSession getHttpSessionById(Long id) {
        try {
            return this.em.find(HttpSession.class, id);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    /**
     * Persist HttpSession to database
     *
     * @param session session to persist
     *
     * @return persisted and managed session
     */
    public HttpSession persistHttpSession(HttpSession session) {
        em.persist(session);
        return session;
    }

    /**
     * Delete an http session
     *
     * @param session session to delete
     */
    public void deleteHttpSession(HttpSession session) {
        Account account = session.getAccount();
        if (account != null){
            account.getHttpSessions().remove(session);
        }
        em.remove(session);
    }

    /**
     * Get list of http session inactive for at least 2 days
     *
     * @return list of old httpSessions
     */
    public List<HttpSession> getExpiredHttpSessions() {
        TypedQuery<HttpSession> query = em.createNamedQuery("HttpSession.getOlderThan", HttpSession.class);
        //var time = OffsetDateTime.now().minusMinutes(10);
        var time = OffsetDateTime.now().minusWeeks(1);
        query.setParameter("time", time);
        List<HttpSession> resultList = query.getResultList();
        logger.trace("Get expired HttpSession (< {}) => {}", time, resultList);
        return resultList;
    }
}
