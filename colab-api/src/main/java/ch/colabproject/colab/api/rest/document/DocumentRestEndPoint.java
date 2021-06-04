/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.document;

import ch.colabproject.colab.api.ejb.DocumentFacade;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.persistence.document.DocumentDao;
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
 * REST document controller
 *
 * @author sandra
 */
@Path("docs")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class DocumentRestEndPoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(DocumentRestEndPoint.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * The document persistence manager
     */
    @Inject
    private DocumentDao documentDao;

    /**
     * The document business logic
     */
    @Inject
    private DocumentFacade documentFacade;

    // *********************************************************************************************
    // CRUD
    // *********************************************************************************************

    /**
     * Retrieve the list of all documents. This is available to admin only
     *
     * @return all known documents
     */
    @GET
    @AdminResource
    public List<Document> getAllDocuments() {
        logger.debug("get all documents");
        return documentDao.findAllDocuments();
    }

    /**
     * Get the document identified by the given id
     *
     * @param id id of the document to fetch
     *
     * @return the document or null
     */
    @GET
    @Path("{id}")
    public Document getDocument(@PathParam("id") Long id) {
        logger.debug("get document #{}", id);
        return documentDao.findDocument(id);
    }

    /**
     * Save changes to database
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

    /**
     * Persist the document
     *
     * @param document the document to persist
     *
     * @return id of the persisted new document
     */
    @POST
    public Long createDocument(Document document) {
        logger.debug("create document {}", document);
        return documentDao.persistDocument(document).getId();
    }

    /**
     * Permanently delete a document
     *
     * @param id id of the document to delete
     */
    @DELETE
    @Path("{id}")
    public void deleteDocument(@PathParam("id") Long id) {
        logger.debug("delete document #{}", id);
        documentDao.deleteDocument(id);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

    /**
     * Get all blocks that make up the document
     *
     * @param id id of the document
     *
     * @return the blocks linked to the document
     */
    @GET
    @Path("{id}/Blocks")
    public List<Block> getBlocksOfDocument(@PathParam("id") Long id) {
        logger.debug("get document #{} blocks", id);
        return documentFacade.getBlocksOfDocument(id);
    }

}
