/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.document;

import ch.colabproject.colab.api.ejb.BlockFacade;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.microchanges.live.LiveManager;
import ch.colabproject.colab.api.microchanges.model.Change;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.document.BlockDao;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import java.util.List;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * REST block controller
 *
 * @author sandra
 */
@Path("blocks")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class BlockRestEndPoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(BlockRestEndPoint.class);

    /**
     * The block persistence manager
     */
    @Inject
    private BlockDao blockDao;

    /**
     * The block-related logic
     */
    @Inject
    private BlockFacade blockFacade;

    /** Live changes manager */
    @Inject
    private LiveManager liveManager;

    /**
     * Get the block identified by the given id
     *
     * @param id id of the block to fetch
     *
     * @return the block or null
     */
    @GET
    @Path("{id}")
    public Block getBlock(@PathParam("id") Long id) {
        logger.debug("get block #{}", id);
        return blockDao.findBlock(id);
    }

    /**
     * Save changes to database
     *
     * @param block block to update
     *
     * @throws ColabMergeException if the merge is impossible
     */
    @PUT
    public void updateBlock(Block block) throws ColabMergeException {
        logger.debug("update block {}", block);
        blockDao.updateBlock(block);
    }

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
    @AdminResource
    public void deletePendingChanges(@PathParam("id") Long id) {
        liveManager.deletePendingChangesAndPropagate(id);
    }

    /**
     * Persist the block
     *
     * @param block the block to persist
     *
     * @return id of the persisted new block
     */
    @POST
    public Long createBlock(Block block) {
        logger.debug("create block {}", block);
        return blockFacade.persistBlock(block).getId();
    }

    /**
     * Create and persist a new text data block
     *
     * @param documentId the id of the document it belongs to
     *
     * @return the new persisted text data block
     */
    @POST
    @Path("newTextData/{documentId}")
    public Block createNewTextDataBlock(@PathParam("documentId") Long documentId) {
        logger.debug("create new text data block for document #{}", documentId);
        return blockFacade.createNewTextDataBlock(documentId);
    }

    /**
     * Permanently delete a block
     *
     * @param id id of the block to delete
     */
    @DELETE
    @Path("{id}")
    public void deleteBlock(@PathParam("id") Long id) {
        logger.debug("delete block #{}", id);
        blockDao.deleteBlock(id);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

    /**
     * Get all sticky note links where the block is the source
     *
     * @param blockId the id of the block
     *
     * @return list of links
     */
    @GET
    @Path("{id}/StickyNoteLinks")
    public List<StickyNoteLink> getStickyNoteLinksAsSrc(@PathParam("id") Long blockId) {
        logger.debug("Get sticky note links where block #{} is the source", blockId);
        return blockFacade.getStickyNoteLinkAsSrc(blockId);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
