/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Simple bean to store session related information
 *
 * @author maxence
 */
public class HttpSession implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Last activity time
     */
    private LocalDateTime time;

    /**
     * Session id
     */
    private String sessionId;

    /**
     * id of the account used for authentication
     */
    private Long accountId;

    /**
     * @return Get last activity time
     */
    public LocalDateTime getTime() {
        return time;
    }

    /**
     * Set last activity time
     *
     * @param time time
     */
    public void setTime(LocalDateTime time) {
        this.time = time;
    }

    /**
     * @return Get the session id
     */
    public String getSessionId() {
        return sessionId;
    }

    /**
     * Set session id
     *
     * @param sessionId id of the session
     */
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    /**
     * @return authenticated account, null if not authenticated
     */
    public Long getAccountId() {
        return accountId;
    }

    /**
     * Set authenticated account id
     *
     * @param accountId id of the account account
     */
    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    /**
     * set last activity time to now
     */
    public void keepAlive() {
        this.time = LocalDateTime.now();
    }
}
