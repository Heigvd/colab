/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.document;

import ch.colabproject.colab.api.controller.document.DocumentManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.jpa.document.DocumentDao;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import java.util.List;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * REST document controller
 *
 * @author sandra
 */
@Path("docs")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class DocumentRestEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(DocumentRestEndpoint.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * The document persistence manager
     */
    @Inject
    private DocumentDao documentDao;

    /**
     * The document specific logic
     */
    @Inject
    private DocumentManager documentManager;

    // *********************************************************************************************
    // CRUD
    // *********************************************************************************************

    /**
     * Get the document identified by the given id
     *
     * @param id id of the document to fetch
     *
     * @return the document or null
     */
    @GET
    @Path("{id: [0-9]+}")
    public Document getDocument(@PathParam("id") Long id) {
        logger.debug("get document #{}", id);
        return documentDao.findDocument(id);
    }

    /**
     * Save changes to database. Only fields which are editable by users will be
     * impacted.
     *
     * @param document document to update
     *
     * @throws ColabMergeException if the merge is impossible
     */
    @PUT
    public void updateDocument(Document document) throws ColabMergeException {
        logger.debug("update document {}", document);
        documentDao.updateDocument(document);
    }

    // *********************************************************************************************
    // change index of a document
    // *********************************************************************************************

    /**
     * Move the given document one floor up
     *
     * @param docId the id of the document to move
     */
    @PUT
    @Path("{docId: [0-9]+}/MoveUp")
    public void moveDocumentUp(@PathParam("docId") Long docId) {
        logger.debug("move document #{} up", docId);

        documentManager.moveDocumentUp(docId);
    }

    /**
     * Move the given document one floor down
     *
     * @param docId the id of the document to move
     */
    @PUT
    @Path("{docId: [0-9]+}/MoveDown")
    public void moveDocumentDown(@PathParam("docId") Long docId) {
        logger.debug("move document #{} down", docId);

        documentManager.moveDocumentDown(docId);
    }

    /**
     * Move the given document above its futureNextDocId
     *
     * @param docId     the id of the document to move
     * @param baseDocId the id of the document which will be below docId
     */
    @PUT
    @Path("{docId: [0-9]+}/MoveAbove/{baseDocId: [0-9]+}")
    public void moveDocumentAbove(@PathParam("docId") Long docId,
            @PathParam("baseDocId") Long baseDocId) {
        logger.debug("move document #{} above #{}", docId, baseDocId);

        documentManager.moveDocumentAbove(docId, baseDocId);
    }

    /**
     * Move the document one floor up
     *
     * @param docId     the id of the document to move
     * @param baseDocId the id of the document which will be above docId
     */
    @PUT
    @Path("{docId: [0-9]+}/MoveBelow/{baseDocId: [0-9]+}")
    public void moveDocumentBelow(@PathParam("docId") Long docId,
            @PathParam("baseDocId") Long baseDocId) {
        logger.debug("move document #{} below #{}", docId, baseDocId);

        documentManager.moveDocumentBelow(docId, baseDocId);
    }

    /**
     * Move the document at the top
     *
     * @param docId the id of the document to move
     */
    @PUT
    @Path("{docId: [0-9]+}/MoveToTop")
    public void moveDocumentToTop(@PathParam("docId") Long docId) {
        logger.debug("move document #{} to the top", docId);

        documentManager.moveDocumentToTop(docId);
    }

    /**
     * Move the document at the bottom
     *
     * @param docId the id of the document to move
     */
    @PUT
    @Path("{docId: [0-9]+}/MoveToBottom")
    public void moveDocumentToBottom(@PathParam("docId") Long docId) {
        logger.debug("move document #{} to the bottom", docId);

        documentManager.moveDocumentToBottom(docId);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

    /**
     * Get all sticky note links where the document is the source
     *
     * @param documentId the id of the document
     *
     * @return list of links
     */
    @GET
    @Path("{id: [0-9]+}/StickyNoteLinks")
    public List<StickyNoteLink> getStickyNoteLinksAsSrc(@PathParam("id") Long documentId) {
        logger.debug("Get sticky note links where document #{} is the source", documentId);
        return documentManager.getStickyNoteLinkAsSrc(documentId);
    }

}
