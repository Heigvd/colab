/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller;

import ch.colabproject.colab.api.model.tracking.Tracking;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import ch.colabproject.colab.api.model.user.HttpSession;
import ch.colabproject.colab.api.security.SessionManager;
import ch.colabproject.colab.api.security.permissions.Conditions.Condition;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Callable;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.ws.rs.container.ContainerRequestContext;
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
    private WebsocketManager websocketManager;

    /** Session manager */
    @Inject
    private SessionManager sessionManager;

    /**
     * id HTTP session associated to current request
     */
    private Long httpSessionId;

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
     * The HTTP request bound to this request.
     */
    private ContainerRequestContext requestContext;

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
     * Get the current httpSession. If subject is not authenticated, null is returned
     *
     * @return the current http session
     */
    public HttpSession getHttpSession() {
        if (this.httpSessionId != null) {
            // make sure to return a managed httpSession
            return userDao.getHttpSessionById(this.httpSessionId);
        } else {
            return null;
        }
    }

    /**
     * Get the current HTTPSession or fails with authenticationRequired exception
     *
     * @return the current http session
     *
     * @throws HttpErrorMessage with authenticationRequired if null
     */
    public HttpSession getAndAssertHttpSession() {
        HttpSession httpSession = getHttpSession();
        if (httpSession != null && httpSession.getAccountId() != null) {
            return httpSession;
        } else {
            throw HttpErrorMessage.authenticationRequired();
        }
    }

    /**
     * Attach id of httpSession to this request
     *
     * @param httpSessionId id of the http session
     */
    public void setHttpSessionId(Long httpSessionId) {
        this.httpSessionId = httpSessionId;
        conditionCache.clear();
    }

    /**
     * Get the current authenticated account
     *
     * @return the current account or null if none
     */
    public Account getCurrentAccount() {
        HttpSession httpSession = getHttpSession();
        if (httpSession != null) {
            return httpSession.getAccount();
            //return userDao.findAccount(this.httpSession.getAccountId());
        } else if (this.currentAccountId != null) {
            return userDao.findAccount(this.currentAccountId);
        } else {
            return null;
        }
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
        this.currentAccountId = account.getId();
        if (this.requestContext != null) {
            // only create an http session is the request is a HTTP request
            String userAgent = requestContext.getHeaderString("user-agent");
            HttpSession httpSession = sessionManager.createHttpSession(account, userAgent);
            setHttpSessionId(httpSession.getId());
        }
    }

    /**
     * Clear current account and unsubscribe from all websocket channels.
     */
    public void logout() {
        HttpSession session = this.getHttpSession();
        this.sudo(() -> {
            this.currentAccountId = null;
            if (session != null) {
                websocketManager.signoutAndUnsubscribeFromAll(this.getHttpSession().getId());
                sessionManager.deleteHttpSession(session);
            }
            setHttpSessionId(null);
        });
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
     * Synchronize the persistence context to the underlying database.
     */
    public void flush() {
        if (txExists()) {
            em.flush();
        }
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
     * @return should or shouldn't track entity updates?
     */
    public boolean isDoNotTrackChange() {
        return doNotTrackChange;
    }

    /**
     * Set request context
     *
     * @param requestContext the request context
     */
    public void setRequestContext(ContainerRequestContext requestContext) {
        this.requestContext = requestContext;
    }

    /**
     * get the requestContext
     *
     * @return the request context if request has been intitated by a REST call, null otherwise
     */
    public ContainerRequestContext getRequestContext() {
        return this.requestContext;
    }
}
