/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security;

import ch.colabproject.colab.api.Helper;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.cache.Cache;

/**
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class SessionManager {

    /**
     * Cluster wide cache for HTTP sessions
     */
    @Inject
    private Cache<String, HttpSession> sessions;

    /**
     * Put session in cache
     *
     * @param session session to cache
     */
    public void save(HttpSession session) {
        String sessionId = session.getSessionId();
        sessions.put(sessionId, session);
    }

    /**
     * Get a session from the cache. Try to reuse given sessionId.
     *
     * @param sessionId session id
     *
     * @return the session to use from now. The session may have a new sessionId !
     */
    public HttpSession getOrCreate(String sessionId) {
        // no session id or sessionId not in cache: generate new sessionId
        if (sessionId == null || !sessions.containsKey(sessionId)) {
            sessionId = Helper.generateHexSalt(32) + "-" + System.currentTimeMillis();
        }

        HttpSession session = sessions.get(sessionId);
        if (session == null) {
            // if no cached session, create on
            session = new HttpSession();
            session.setSessionId(sessionId);
            sessions.put(sessionId, session);
        }
        return session;
    }
}
