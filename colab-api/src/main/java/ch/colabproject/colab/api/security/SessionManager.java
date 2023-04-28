/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.WebsocketManager;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.HttpSession;
import ch.colabproject.colab.api.model.user.InternalHashMethod;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.user.HttpSessionDao;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import javax.cache.Cache;
import javax.cache.processor.MutableEntry;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.cp.lock.FencedLock;
import com.hazelcast.flakeidgen.FlakeIdGenerator;
import com.hazelcast.map.IMap;

/**
 * Bean to manage HTTP sessions
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class SessionManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(SessionManager.class);

    /** hazelcast instance */
    @Inject
    private HazelcastInstance hzInstance;

    /** User persistence handling */
    @Inject
    private UserDao userDao;

    /** Http session persistence handling */
    @Inject
    private HttpSessionDao httpSessionDao;

    /**
     * Websocket business logic
     */
    @Inject
    private WebsocketManager websocketManager;

    /** request manager */
    @Inject
    private RequestManager requestManager;

    /** cache of failed authentication (key = account id) */
    @Inject
    private Cache<Long, AuthenticationFailure> authenticationFailureCache;

    /**
     * get user activity date cache. Map user id with activity date
     */
    private IMap<Long, OffsetDateTime> getUserActivityCache() {
        return hzInstance.getMap("USER_ACTIVITY_CACHE");
    }

    /**
     * get http session activity date cache. Map http session id with activity date
     */
    private IMap<Long, OffsetDateTime> getHttpSessionActivityCache() {
        return hzInstance.getMap("HTTP_SESSION_ACTIVITY_CACHE");
    }

    /**
     * Get a persisted session.
     *
     * @param sessionId session id
     * @param secret    the session secret
     *
     * @return a session if it exists or null
     */
    public HttpSession getAndValidate(Long sessionId, String secret) {
        HttpSession httpSession = httpSessionDao.findHttpSession(sessionId);

        if (httpSession != null) {
            try {
                // hash the secret sent by the client
                byte[] hash = InternalHashMethod.SHA_512.hash(secret);
                httpSession.getSessionSecret();
                if (Helper.constantTimeArrayEquals(hash, httpSession.getSessionSecret())) {
                    return httpSession;
                } else {
                    logger.error("Cookie secret does not match");
                }
            } catch (NoSuchAlgorithmException ex) {
                logger.error("SHA_512 NOT FOUND, THIS IS NOT GOOD; PLEASE INVESTIGATE");
            }
        }
        return null;
    }

    /**
     * Create and persist a new HTTP Session bound.
     *
     * @param account   the account the session is bound to
     * @param userAgent client user-agent
     *
     * @return brand new persisted HTTPsession
     */
    public HttpSession createHttpSession(Account account, String userAgent) {
        logger.debug("Creater new HttpSession for {}", account);
        FlakeIdGenerator idGenerator = hzInstance.getFlakeIdGenerator("HTTP_SESSION_ID_GENERATOR");

        String rawSecret = Helper.generateHexSalt(64) + "-" + idGenerator.newId();
        byte[] secret;

        try {
            secret = InternalHashMethod.SHA_512.hash(rawSecret);
        } catch (NoSuchAlgorithmException ex) {
            secret = rawSecret.getBytes(StandardCharsets.UTF_8);
            logger.error("SHA_512 NOT FOUND, THIS IS NOT GOOD; PLEASE INVESTIGATE");
        }

        HttpSession httpSession = new HttpSession();

        httpSession.setRawSessionSecret(rawSecret);
        httpSession.setSessionSecret(secret);

        httpSession.setAccount(account);
        account.getHttpSessions().add(httpSession);
        httpSession.setLastSeen(OffsetDateTime.now());

        if (userAgent != null) {
            httpSession.setUserAgent(userAgent);
        } else {
            httpSession.setUserAgent("");
        }

        return httpSessionDao.persistHttpSession(httpSession);
    }

    /**
     * Remove httpSession
     *
     * @param session the httpSession to delete
     */
    public void deleteHttpSession(HttpSession session) {
        Account account = session.getAccount();

        if (account != null) {
            account.getHttpSessions().remove(session);
        }

        websocketManager.signoutAndUnsubscribeFromAll(session.getId());

        httpSessionDao.deleteHttpSession(session);
    }

    /**
     * keep trace of failed authentication attempt
     *
     * @param account the local account for which authentication failed
     *
     * @return the number of failed attempts in a row
     */
    public Long authenticationFailure(LocalAccount account) {
        return this.authenticationFailureCache.invoke(account.getId(),
            (MutableEntry<Long, AuthenticationFailure> entry, Object... arguments) -> {
                if (entry.exists()) {
                    AuthenticationFailure value = entry.getValue();
                    value.inc();
                    entry.setValue(value);
                    return entry.getValue().getCounter();
                } else {
                    entry.setValue(new AuthenticationFailure());
                    return 1L;
                }
            });
    }

    /**
     * clear failed attempts for given account
     *
     * @param account the account to clear attempts for
     */
    public void resetAuthenticationAttemptHistory(LocalAccount account) {
        this.authenticationFailureCache.remove(account.getId());
    }

    /**
     * Get history of failed authentication attempts for an account
     *
     * @param account account
     *
     * @return authentication failure history or null
     */
    public AuthenticationFailure getAuthenticationAttempt(LocalAccount account) {
        return this.authenticationFailureCache.get(account.getId());
    }

    /**
     * Touch activity date for currentAccount
     */
    public void touchUserActivityDate() {
        HttpSession httpSession = requestManager.getHttpSession();
        User user = requestManager.getCurrentUser();
        OffsetDateTime now = OffsetDateTime.now();
        logger.trace("Touch Activity ({}, {}) => {}", httpSession, user, now);

        if (httpSession != null) {
            getHttpSessionActivityCache().set(httpSession.getId(), now);
        }
        if (user != null && user.getId() != null) {
            user.setActivityDate(now);
            getUserActivityCache().set(user.getId(), now);
        }
    }

    /**
     * Get effective activity date for account
     *
     * @param user the account
     *
     * @return effective activity date
     */
    public OffsetDateTime getActivityDate(User user) {
        if (user != null) {
            if (user.getId() != null) {
                OffsetDateTime date = getUserActivityCache().get(user.getId());
                if (date != null) {
                    return date;
                }
            }
            return user.getActivityDate();
        }
        return null;
    }

    /**
     * Write in-cache activity-date to database
     */
    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public void writeActivityDatesToDatabase() {
        logger.trace("Write Activity Date to DB");
        FencedLock lock = hzInstance.getCPSubsystem().getLock("CleanExpiredHttpSession");
        if (lock.tryLock()) {
            try {
                requestManager.sudo(() -> {
                    // prevent updating tracking data (updated by and at)
                    requestManager.setDoNotTrackChange(true);
                    IMap<Long, OffsetDateTime> userActivityCache = getUserActivityCache();
                    Iterator<Map.Entry<Long, OffsetDateTime>> iterator = userActivityCache
                        .iterator();
                    while (iterator.hasNext()) {
                        Map.Entry<Long, OffsetDateTime> next = iterator.next();
                        iterator.remove();
                        if (next != null) {
                            Long userId = next.getKey();
                            if (userId != null) {
                                User user = userDao.findUser(userId);
                                OffsetDateTime date = next.getValue();
                                if (user != null) {
                                    logger.trace("Update User LastSeenAt: {}", date);
                                    user.setLastSeenAt(date);
                                }
                            }
                        }
                    }

                    IMap<Long, OffsetDateTime> sessionActivityCache = getHttpSessionActivityCache();
                    iterator = sessionActivityCache.iterator();
                    while (iterator.hasNext()) {
                        Map.Entry<Long, OffsetDateTime> next = iterator.next();
                        iterator.remove();
                        if (next != null) {
                            Long id = next.getKey();
                            if (id != null) {
                                HttpSession session = httpSessionDao.findHttpSession(id);
                                if (session != null) {
                                    OffsetDateTime date = next.getValue();
                                    logger.trace("Update HTTP session LastSeen: {}", date);
                                    session.setLastSeen(date);
                                }
                            }
                        }
                    }
                });
            } finally {
                lock.unlock();
            }
        }
    }

    /**
     * Clean database. Remove expired HttpSession.
     */
    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public void clearExpiredHttpSessions() {
        logger.trace("Clear expired HTTP session");
        requestManager.sudo(() -> {
            FencedLock lock = hzInstance.getCPSubsystem().getLock("CleanExpiredHttpSession");
            if (lock.tryLock()) {
                try {
                    logger.trace("Got the lock, let's clear");
                    List<HttpSession> list = httpSessionDao.findExpiredHttpSessions();
                    logger.trace("List of expired http session: {}", list);
                    IMap<Long, OffsetDateTime> cache = getHttpSessionActivityCache();
                    for (HttpSession session : list) {
                        if (!cache.containsKey(session.getId())) {
                            logger.trace("Delete the http session {}", session);
                            deleteHttpSession(session);
                        } else {
                            logger.trace("Seems http Session just woke up: {}", session);
                        }
                    }
                } finally {
                    lock.unlock();
                }
            } else {
                logger.trace("Did not get the lock");
            }
        });
    }
}
