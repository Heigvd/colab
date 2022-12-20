/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.document;

import ch.colabproject.colab.api.microchanges.live.LiveManager;
import ch.colabproject.colab.api.microchanges.live.monitoring.BlockMonitoring;
import ch.colabproject.colab.api.microchanges.model.Change;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import java.util.List;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

/**
 * REST micro changes controller
 *
 * @author maxence
 */
@Path("changes")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class ChangeRestEndpoint {

    /** logger */
    // private static final Logger logger = LoggerFactory.getLogger(ChangesRestEndpoint.class);

    /**
     * Live changes manager
     */
    @Inject
    private LiveManager liveManager;

    /**
     * Get all pending changes for given block.
     *
     * @param id id of the block
     *
     * @return list of changes.
     */
    @GET
    @Path("/{id}/changes")
    public List<Change> getChanges(@PathParam("id") Long id) {
        return liveManager.getPendingChanges(id);
    }

    /**
     * Patch a block with a change
     *
     * @param id     id of the block
     * @param change change
     */
    @PUT
    @Path("/{id}")
    public void patchBlock(@PathParam("id") Long id, Change change) {
        liveManager.patchBlock(id, change);
    }

    /**
     * Patch a block with a change
     *
     * @param id id of the block
     */
    @PUT
    @Path("/{id}/dropChanges")
    public void deletePendingChanges(@PathParam("id") Long id) {
        liveManager.deletePendingChangesAndPropagate(id);
    }

    /**
     * get data to monitor block with pending changes
     *
     * @return list of block being edited and their status
     */
    @GET
    @Path("/Monitoring")
    @AdminResource
    public List<BlockMonitoring> getMonitoringData(){
        return liveManager.getMonitoringData();
    }

}
