/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.user.UserDao;
import ch.colabproject.colab.api.security.HttpSession;
import java.util.concurrent.Callable;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 * Request sidekick.
 *
 * @author maxence
 */
@RequestScoped
public class RequestManager {

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * User-related business logic
     */
    @Inject
    private UserDao userDao;

    /**
     * Websocket business logic
     */
    @Inject
    private WebsocketFacade websocketFacade;

    /**
     * HTTP session associated to current request
     */
    private HttpSession httpSession;

    /**
     * Timestamp as return by {@link System#currentTimeMillis() } the request starts at
     */
    private long startTime;

    /**
     * Base url request URL
     */
    private String baseUrl;

    /**
     * Id of the current user account
     */
    private Long currentAccountId;

    /**
     * Indicates if current user can act as an admin
     */
    private boolean sudoAsAdmin = false;

    /**
     * Get request base url
     *
     * @return url
     */
    public String getBaseUrl() {
        return baseUrl;
    }

    /**
     * Set the request base url
     *
     * @param baseUrl request base url
     */
    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     *
     * @return the current http session
     */
    public HttpSession getHttpSession() {
        return this.httpSession;
    }

    /**
     * Attach httpSession to this request
     *
     * @param httpSession http session
     */
    public void setHttpSession(HttpSession httpSession) {
        this.httpSession = httpSession;
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            currentUser.touchLastSeenAt();
        }
    }

    /**
     * Get the current authenticated account
     *
     * @return the current account or null if none
     */
    public Account getCurrentAccount() {
        if (this.httpSession != null) {
            return userDao.findAccount(this.httpSession.getAccountId());
        } else if (this.currentAccountId != null) {
            return userDao.findAccount(this.currentAccountId);
        }
        return null;
    }

    /**
     * Get the current authenticated user
     *
     * @return the current user or null if none
     */
    public User getCurrentUser() {
        Account account = this.getCurrentAccount();

        if (account != null) {
            return account.getUser();
        } else {
            return null;
        }
    }

    /**
     * set time the current request started
     *
     * @param timestamp start timestamp
     *
     */
    public void setStartTime(long timestamp) {
        this.startTime = timestamp;
    }

    /**
     * Return the time the request started
     *
     * @return start time timestamp in ms
     */
    public long getStartTime() {
        return startTime;
    }

    /**
     * Is the request ran by an authenticated user ?
     *
     * @return true if the current user is fully authenticated
     */
    public Boolean isAuthenticated() {
        return this.getCurrentAccount() != null;
    }

    /**
     * Set the current account.
     *
     * @param account new current account
     */
    public void login(Account account) {
        HttpSession session = this.getHttpSession();
        if (session != null) {
            session.setAccountId(account.getId());
        }
        this.currentAccountId = account.getId();
    }

    /**
     * Clear current account and unsubscribe from all websocket channels.
     */
    public void logout() {
        HttpSession session = this.getHttpSession();
        this.currentAccountId = null;
        if (session != null) {
            session.setAccountId(null);
            websocketFacade.signoutAndUnsubscribeFromAll(this.getHttpSession().getSessionId());
        }
    }

    /**
     * Execute some piece of code with admin privileges.
     *
     * @param action code to execute with admin privileges
     */
    public void sudo(Runnable action) {
        // make sure to flush to check every pending changes before granting admin rights
        em.flush();
        this.sudoAsAdmin = true;
        action.run();
        // make sure to flush to apply all pending changes with admin rights
        em.flush();
        this.sudoAsAdmin = false;
    }

    /**
     * Execute some piece of code with admin privileges and return something.
     *
     * @param <R>    return type
     * @param action code to execute with admin privileges
     *
     * @return action result
     *
     * @throws java.lang.Exception if something is thrown during the call
     */
    public <R> R sudo(Callable<R> action) throws Exception {
        // make sure to flush to check every pending changes before granting admin rights
        em.flush();
        this.sudoAsAdmin = true;
        R result = action.call();
        // make sure to flush to apply all pending changes with admin rights
        em.flush();
        this.sudoAsAdmin = false;

        return result;
    }

    /**
     * Is the currentUser is an admin or sudo as an admin ?
     *
     * @return true if current user can act as an admin
     */
    public boolean isAdmin() {
        User currentUser = this.getCurrentUser();
        return sudoAsAdmin || (currentUser != null && currentUser.isAdmin());
    }
}
