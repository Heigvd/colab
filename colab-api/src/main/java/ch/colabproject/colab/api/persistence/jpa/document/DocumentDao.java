/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
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
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
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
     * Find a document by id
     *
     * @param id the id of the document to fetch
     *
     * @return the document with the given id or null if such a document does not exist
     */
    public Document findDocument(Long id) {
        logger.trace("find document #{}", id);

        return em.find(Document.class, id);
    }

    /**
     * Find a text data block by id
     *
     * @param id the id of the text data block to fetch
     *
     * @return the text data block with the given id or null if such a text data block does not
     *         exist
     */
    public TextDataBlock findTextDataBlock(Long id) {
        logger.trace("find text data block #{}", id);

        return em.find(TextDataBlock.class, id);
    }

    /**
     * Update document. Only fields which are editable by users will be impacted.
     *
     * @param document the document as supplied by clients (ie not managed by JPA)
     *
     * @return return updated managed document
     *
     * @throws ColabMergeException if the update failed
     */
    public Document updateDocument(Document document) throws ColabMergeException {
        logger.trace("update document {}", document);

        Document managedDocument = this.findDocument(document.getId());

        managedDocument.merge(document);

        return managedDocument;
    }

//    /**
//     * Update text data block. Only fields which are editable by users will be impacted.
//     *
//     * @param textDataBlock the text data block as supplied by clients (ie not managed by JPA)
//     *
//     * @return return updated managed text data block
//     *
//     * @throws ColabMergeException if the update failed
//     */
//    public TextDataBlock updateTextDataBlock(TextDataBlock textDataBlock) throws ColabMergeException {
//        logger.trace("update text data block {}", textDataBlock);
//
//        TextDataBlock managedTextDataBlock = this.findTextDataBlock(textDataBlock.getId());
//
//        managedTextDataBlock.merge(textDataBlock);
//
//        return managedTextDataBlock;
//    }

    /**
     * Persist a brand new document to database
     *
     * @param document the new document to persist
     *
     * @return the new persisted and managed document
     */
    public Document persistDocument(Document document) {
        logger.trace("persist document {}", document);

        em.persist(document);

        return document;
    }

    /**
     * Delete the document from database. This can't be undone
     *
     * @param document the document to delete
     */
    public void deleteDocument(Document document) {
        logger.trace("delete document {}", document);

        // TODO: move to recycle bin first

        em.remove(document);
    }

}
