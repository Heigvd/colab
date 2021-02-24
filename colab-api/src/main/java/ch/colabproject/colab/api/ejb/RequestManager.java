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
import java.io.Serializable;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;

/**
 * Request sidekick.
 *
 * @author maxence
 */
@RequestScoped
public class RequestManager implements Serializable {

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
     * Get the current authenticated user
     *
     * @return the current user
     */
    public User getCurrentUser() {
        if (this.httpSession != null) {
            Account account = userManagement.findAccount(this.httpSession.getAccountId());
            if (account != null) {
                return account.getUser();
            }
        }
        return null;
    }
}
