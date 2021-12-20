/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.tracking.Tracking;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import ch.colabproject.colab.api.security.HttpSession;
import ch.colabproject.colab.api.security.permissions.Conditions.Condition;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Callable;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Request sidekick.
 *
 * @author maxence
 */
@RequestScoped
public class RequestManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(RequestManager.class);

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
     * To store condition which have already been evaluated
     */
    private final Map<Condition, Boolean> conditionCache = new HashMap<>();

    /**
     * Indicates if current user can act as an admin. 0 = no sudo greater than 0 => sudo
     */
    private int sudoAsAdmin = 0;

    /**
     * is the thread run in the so-called security transaction ?
     */
    private boolean inSecurityTx = false;

    /**
     * Is the current transaction already completed ?
     */
    private boolean txDone = false;

    /**
     * In some case, {@link Tracking tracking data} shouldn't be updated. Setting this boolean to
     * prevent allow such behaviour.
     */
    private boolean doNotTrackChange = false;

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
            conditionCache.clear();
            websocketFacade.signoutAndUnsubscribeFromAll(this.getHttpSession().getSessionId());
        }
    }

    /**
     * Is current transaction still alive ?
     *
     * @return true if current tx is not dead
     */
    private boolean txExists() {
        return !this.txDone;
    }

    /**
     * Execute some piece of code with admin privileges.
     *
     * @param action code to execute with admin privileges
     */
    public void sudo(Runnable action) {
        if (txExists()) {
            // make sure to flush to check every pending changes before granting admin rights
            em.flush();
        }

        this.sudoAsAdmin++;
        logger.trace("Sudo #{}", this.sudoAsAdmin);
        action.run();
        if (txExists()) {
            // make sure to flush to apply all pending changes with admin rights
            em.flush();
        }

        logger.trace("EndOfSudo #{}", this.sudoAsAdmin);

        this.sudoAsAdmin--;
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
        if (txExists()) {
            // make sure to flush to check every pending changes before granting admin rights
            em.flush();
        }
        this.sudoAsAdmin++;
        logger.trace("Sudo #{}", this.sudoAsAdmin);
        R result = action.call();
        if (txExists()) {
            // make sure to flush to apply all pending changes with admin rights
            em.flush();
        }
        logger.trace("EndOfSudo #{}", this.sudoAsAdmin);
        this.sudoAsAdmin--;

        return result;
    }

    /**
     * Is the currentUser is an admin or sudo as an admin ?
     *
     * @return true if current user can act as an admin
     */
    public boolean isAdmin() {
        // the sudoAsAdmin is done at first,
        // so we do not need to get the current user if this condition is fulfilled
        if (sudoAsAdmin > 0) {
            return true;
        }

        User currentUser = this.getCurrentUser();
        return currentUser != null && currentUser.isAdmin();
    }

    /**
     * Register condition result
     *
     * @param condition the condition
     * @param result    the result
     */
    public void registerConditionResult(Condition condition, Boolean result) {
        this.conditionCache.put(condition, result);
    }

    /**
     * Get the cached condition result
     *
     * @param condition condition
     *
     * @return true or false if the condition is cached, null if the condition has not been
     *         evaluated yet
     */
    public Boolean getConditionResult(Condition condition) {
        return this.conditionCache.get(condition);
    }

    /**
     * Is the thread run in a transaction dedicated to security condition evaluation
     *
     * @return true/false
     */
    public boolean isInSecurityTx() {
        return inSecurityTx;
    }

    /**
     * Change the inSecurityTx flag
     *
     * @param inSecurityTx new flag
     */
    public void setInSecurityTx(boolean inSecurityTx) {
        this.inSecurityTx = inSecurityTx;
    }

    /**
     * Check if the current transaction is already done
     *
     * @return whether or not the current transaction is already done
     */
    public boolean isTxDone() {
        return txDone;
    }

    /**
     * Mark the current transaction as done or undone
     *
     * @param txDone whether or not the current transaction is already done
     */
    public void setTxDone(boolean txDone) {
        this.txDone = txDone;
    }

    /**
     * Set Do-Not-Track-Change boolean
     *
     * @param value the new value
     */
    public void setDoNotTrackChange(boolean value) {
        this.doNotTrackChange = value;
    }

    /**
     * Get Do-Not-Track-Change value
     *
     * @return should ou shouldn't track entity updates?
     */
    public boolean isDoNotTrackChange() {
        return doNotTrackChange;
    }
}
