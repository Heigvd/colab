/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.ejb.RequestManager;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.user.UserDao;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import java.time.OffsetDateTime;
import java.util.Iterator;
import java.util.Map;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    /** user DAO */
    @Inject
    private UserDao userDao;

    /** request manager */
    @Inject
    private RequestManager requestManager;

    /**
     * Get cluster-wide cache for HTTP sessions
     *
     * @return the session cache
     */
    private IMap<String, HttpSession> getSessionsCache() {
        return hzInstance.getMap("HTTP_SESSIONS_CACHE");
        //return hzInstance.getCacheManager().getCache("HTTP_SESSIONS_CACHE");
    }

    /**
     * get user activity date cache. Map user id with activity date
     */
    private IMap<Long, OffsetDateTime> getActivityCache() {
        return hzInstance.getMap("USER_ACTIVITY_CACHE");
    }

    /**
     * Put session in cache
     *
     * @param session session to cache
     */
    public void save(HttpSession session) {
        String sessionId = session.getSessionId();
        getSessionsCache().put(sessionId, session);
    }

    /**
     * Get a session from the cache. Try to reuse given sessionId.
     *
     * @param sessionId session id
     *
     * @return the session to use from now. The session may have a new sessionId !
     */
    public HttpSession getOrCreate(String sessionId) {
        IMap<String, HttpSession> sessions = getSessionsCache();
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

    /**
     * Touch activity date for user
     *
     * @param user the user
     */
    public void touchUserActivityDate(User user) {
        if (user != null && user.getId() != null) {
            getActivityCache().put(user.getId(), OffsetDateTime.now());
        }
    }

    /**
     * Get effective activity date for user
     *
     * @param user the user
     *
     * @return effective activity date
     */
    public OffsetDateTime getActivityDate(User user) {
        if (user != null) {
            if (user.getId() != null) {
                OffsetDateTime date = getActivityCache().get(user.getId());
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
        requestManager.sudo(() -> {
            // prevent updating tracking data (updated by and at)
            requestManager.setDoNotTrackChange(true);
            IMap<Long, OffsetDateTime> activityCache = getActivityCache();
            Iterator<Map.Entry<Long, OffsetDateTime>> iterator = activityCache.iterator();
            while (iterator.hasNext()) {
                Map.Entry<Long, OffsetDateTime> next = iterator.next();
                if (next != null) {
                    Long userId = next.getKey();
                    if (userId != null) {
                        User user = userDao.findUser(userId);
                        OffsetDateTime date = activityCache.remove(userId);
                        if (user != null) {
                            user.setLastSeenAt(date);
                        }
                    }
                }
            }
        });
    }
}
