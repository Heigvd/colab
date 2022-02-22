/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Document persistence
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class DocumentDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(DocumentDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * @param id the id of the document to fetch
     *
     * @return the document with the given id or null if such a document does not exists
     */
    public Document findDocument(Long id) {
        try {
            logger.debug("find document #{}", id);
            return em.find(Document.class, id);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    /**
     * @param id the id of the text data block to fetch
     *
     * @return the text data block with the given id or null if such a document does not exists
     */
    public TextDataBlock findTextDataBlock(Long id) {
        try {
            logger.debug("find text data block #{}", id);
            return em.find(TextDataBlock.class, id);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    /**
     * Update document
     *
     * @param document the document as supply by clients (ie not managed)
     *
     * @return the updated managed document
     *
     * @throws ColabMergeException if updating the document failed
     */
    public Document updateDocument(Document document) throws ColabMergeException {
        logger.debug("update document {}", document);
        Document mDocument = this.findDocument(document.getId());
        mDocument.merge(document);
        return mDocument;
    }

    /**
     * Update text data block
     *
     * @param document the text data block as supply by clients (ie not managed)
     *
     * @return the updated managed text data block
     *
     * @throws ColabMergeException if updating the document failed
     */
    public TextDataBlock updateTextDataBlock(TextDataBlock document) throws ColabMergeException {
        logger.debug("update text data block {}", document);
        TextDataBlock mDocument = this.findTextDataBlock(document.getId());
        mDocument.merge(document);
        return mDocument;
    }

    /**
     * Persist a brand new document to database
     *
     * @param document the new document to persist
     *
     * @return the new persisted document
     */
    public Document persistDocument(Document document) {
        logger.debug("persist document {}", document);
        em.persist(document);
        return document;
    }

    /**
     * Delete document from database. This can't be undone
     *
     * @param id the id of the document to delete
     *
     * @return just deleted document
     */
    public Document deleteDocument(Long id) {
        logger.debug("delete document #{}", id);
        // TODO: move to recycle bin first
        Document document = this.findDocument(id);
        em.remove(document);
        return document;
    }

}
