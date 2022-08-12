/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jcr;

import ch.colabproject.colab.api.model.project.Project;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import javax.annotation.Resource;
import javax.inject.Inject;
import javax.jcr.Repository;
import javax.jcr.RepositoryException;
import javax.transaction.TransactionScoped;
import javax.transaction.TransactionSynchronizationRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author maxence
 */
@TransactionScoped
public class JcrSessionManager implements Serializable {

    private static final long serialVersionUID = 1L;

    /** Logger */
    private static final Logger logger = LoggerFactory.getLogger(JcrSessionManager.class);

    /**
     * Opened session mapped by project id
     */
    private final Map<Long, JcrSession> sessions = new HashMap<>();

    /** Access to the repository */
    @Inject
    private JcrRepository jcrRepository;

    /**
     * Tx sync registry
     */
    @Resource
    private transient TransactionSynchronizationRegistry jtaSyncRegistry;

    /**
     * Get a session to the project workspace. If the current transaction has already opened a
     * session to this project, existing session is returned.
     *
     * @param project the project
     *
     * @return the session
     *
     * @throws javax.jcr.RepositoryException if something went wring
     */
    public JcrSession getSession(Project project) throws RepositoryException {
        if (sessions.containsKey(project.getId())) {
            logger.trace("GetExisting session: project #{}", project.getId());
            return sessions.get(project.getId());
        } else {
            logger.trace("Create new session: project #{}", project.getId());
            Repository repo = jcrRepository.getRepository();
            JcrSession session = new JcrSession(repo, project);
            sessions.put(project.getId(), session);

            JcrSynchronizer jcrSynchronizer = new JcrSynchronizer(session);
            jtaSyncRegistry.registerInterposedSynchronization(jcrSynchronizer);

            return session;
        }
    }
}
