/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.user;

import ch.colabproject.colab.api.model.user.HttpSession;
import java.time.OffsetDateTime;
import java.util.List;
import jakarta.ejb.LocalBean;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Http session persistence
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class HttpSessionDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(HttpSessionDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find a persisted HttpSession by id
     *
     * @param id the id of the http session to fetch
     *
     * @return the http session with the given id or null if such a http session does not exist
     */
    public HttpSession findHttpSession(Long id) {
        logger.trace("find http session #{}", id);

        return em.find(HttpSession.class, id);
    }

    /**
     * Get list of http session inactive for at least 1 week
     *
     * @return list of old httpSessions
     */
    public List<HttpSession> findExpiredHttpSessions() {
        TypedQuery<HttpSession> query = em.createNamedQuery("HttpSession.getOlderThan",
            HttpSession.class);

        // OffsetDateTime time = OffsetDateTime.now().minusMinutes(10);
        OffsetDateTime time = OffsetDateTime.now().minusWeeks(1);
        query.setParameter("time", time);

        List<HttpSession> resultList = query.getResultList();

        logger.trace("Get expired HttpSession (< {}) => {}", time, resultList);
        return resultList;
    }

    /**
     * Persist a brand new http session to database
     *
     * @param session the new http session to persist
     *
     * @return the new persisted and managed http session
     */
    public HttpSession persistHttpSession(HttpSession session) {
        logger.trace("persist http session {}", session);

        em.persist(session);

        return session;
    }

    /**
     * Delete a http session. This can't be undone
     *
     * @param session the http session to delete
     */
    public void deleteHttpSession(HttpSession session) {
        logger.trace("delete http session {}", session);

        em.remove(session);
    }

}
