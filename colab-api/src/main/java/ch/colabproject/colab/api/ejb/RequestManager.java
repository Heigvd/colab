/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.security.HttpSession;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;

/**
 * Request sidekick.
 *
 * @author maxence
 */
@RequestScoped
public class RequestManager {

    /**
     * User-related business logic
     */
    @Inject
    private UserManagement userManagement;

    /**
     * HTTP session associated to current request
     */
    private HttpSession httpSession;

    /**
     * Timestamp as return by {@link System#currentTimeMillis() } the request starts at
     */
    private long startTime;

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
            return userManagement.findAccount(this.httpSession.getAccountId());
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
}
