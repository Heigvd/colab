/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.presence;

import ch.colabproject.colab.api.controller.EntityGatheringBagForPropagation;
import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.team.TeamManager;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.project.ProjectDao;
import ch.colabproject.colab.api.presence.model.TouchUserPresence;
import ch.colabproject.colab.api.presence.model.UserPresence;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.cp.lock.FencedLock;
import com.hazelcast.map.IMap;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * To manages user presence
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class PresenceManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(PresenceManager.class);

    /** Hazelcast instance. */
    @Inject
    private HazelcastInstance hzInstance;

    /**
     * To register presence
     */
    @Inject
    private EntityGatheringBagForPropagation transactionManager;

    /** To load project */
    @Inject
    private ProjectDao projectDao;

    /** To fetch teamMembers */
    @Inject
    private TeamManager teamManager;

    /** to fetch current user */
    @Inject
    private RequestManager requestManager;

    /**
     * Get shared cache of presence.
     * <p>
     * projectId => wsSessionId => UserPresence
     */
    private IMap<Long, Map<String, UserPresence>> getCache() {
        return hzInstance.getMap("PRESENCE_CACHE");
    }

    /**
     * Get the lock for the given project id
     *
     * @param id id of the project
     *
     * @return the lock
     */
    private FencedLock getLock(Long id) {
        return hzInstance.getCPSubsystem().getLock("Project-Presence-" + id);
    }

    /**
     * Get presence list for the current project
     *
     * @param projectId if of the project
     *
     * @return presence list
     */
    public Collection<UserPresence> getPresenceList(Long projectId) {
        // just to check read access to project
        projectDao.findProject(projectId);

        Map<String, UserPresence> get = null;
        try {
            get = getCache().get(projectId);
        } catch (RuntimeException e) {
            logger.warn("Unable to fetch presence list", e);
        }

        if (get != null) {
            return get.values();
        } else {
            return new HashSet<>();
        }
    }

    /**
     * Register and propagate user presence
     *
     * @param touch presence data
     */
    public void updateUserPresence(TouchUserPresence touch) {
        if (touch != null && touch.getProjectId() != null && touch.getWsSessionId() != null) {
            Long projectId = touch.getProjectId();

            Project project = projectDao.findProject(projectId);
            User currentUser = requestManager.getCurrentUser();
            TeamMember member = teamManager.findMemberByProjectAndUser(project, currentUser);

            String wsSessionId = touch.getWsSessionId();
            FencedLock lock = getLock(projectId);
            UserPresence userPresence = new UserPresence(touch);

            // no member => user is an admin
            if (member != null) {
                userPresence.setTeamMemberId(member.getId());
            }

            try {
                lock.lock();
                IMap<Long, Map<String, UserPresence>> cache = getCache();
                cache.putIfAbsent(projectId, new HashMap<>());
                Map<String, UserPresence> projectPresence = cache.get(projectId);
                projectPresence.put(wsSessionId, userPresence);
                cache.put(projectId, projectPresence);

                transactionManager.registerUpdate(userPresence);
            } catch (RuntimeException e) {
                logger.warn("Unable to update user presence", e);
            } finally {
                lock.unlock();
            }
        }
    }

    /**
     * User has just left, clear from activity table and propagate.
     *
     * @param projectId   id of the project
     * @param wsSessionId the sessionId to clean
     */
    public void clearWsSession(Long projectId, String wsSessionId) {

        FencedLock lock = getLock(projectId);
        try {
            lock.lock();
            IMap<Long, Map<String, UserPresence>> cache = getCache();
            Map<String, UserPresence> projectPresence = cache.get(projectId);

            if (projectPresence != null) {
                UserPresence remove = projectPresence.remove(wsSessionId);
                transactionManager.registerDeletion(remove);
                if (projectPresence.isEmpty()) {
                    cache.delete(projectId);
                } else {
                    // make sure to cal setValue to save the change!
                    cache.put(projectId, projectPresence);
                }
            }
        } catch (RuntimeException e) {
            logger.warn("Unable to remove wsSession", e);
        } finally {
            lock.unlock();
        }
    }

    /**
     * Clear presence list for the given project
     *
     * @param projectId id of the project
     */
    public void clearProjectPresenceList(Long projectId) {
        // laod project to check permissions
        projectDao.findProject(projectId);

        FencedLock lock = getLock(projectId);

        try {
            lock.lock();
            getCache().delete(projectId);
        } finally {
            lock.unlock();
        }
    }

    /**
     * Clear all presence lists
     */
    public void clearAllPresenceLists() {
        if (requestManager.getCurrentUser().isAdmin()) {
            getCache().evictAll();
        }
    }
}
