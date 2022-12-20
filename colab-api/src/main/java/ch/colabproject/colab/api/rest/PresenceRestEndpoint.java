/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.presence.model.TouchUserPresence;
import ch.colabproject.colab.api.presence.model.UserPresence;
import ch.colabproject.colab.api.presence.PresenceManager;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import java.util.Collection;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * API to manage presence
 *
 * @author maxence
 */
@Path("presence")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class PresenceRestEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(PresenceRestEndpoint.class);

    /**
     * Presence business logic
     */
    @Inject
    private PresenceManager presenceManager;

    /**
     * get the presence list for the current project.
     *
     * @param projectId id of the project
     *
     * @return current presence list
     */
    @GET
    @Path("{projectId: [0-9]*}")
    public Collection<UserPresence> getProjectPresence(
        @PathParam("projectId") Long projectId
    ) {
        logger.debug("Get Project Presence List #{}", projectId);
        return presenceManager.getPresenceList(projectId);
    }

    /**
     * Make presence of a user known
     *
     * @param presence presence data
     */
    @PUT
    public void updateUserPresence(TouchUserPresence presence) {
        presenceManager.updateUserPresence(presence);
    }

    /**
     * Clear presence list for the given project
     *
     * @param projectId id of the project
     */
    @DELETE
    @Path("{projectId: [0-9]*}")
    public void clearProjectPresenceList(@PathParam("projectId") Long projectId) {
        presenceManager.clearProjectPresenceList(projectId);
    }

    /**
     * Clear all presence lists
     */
    @DELETE
    @AdminResource
    public void clearAllPresenceList() {
        presenceManager.clearAllPresenceLists();
    }
}
