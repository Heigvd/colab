/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.jpa.document.DocumentDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.MessageI18nKey;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Document specific logic
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class DocumentManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(DocumentManager.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Document persistence handler
     */
    @Inject
    private DocumentDao documentDao;

    /**
     * Index generation specific logic management
     */
    @Inject
    private IndexGeneratorHelper<Document> indexGenerator;

    // *********************************************************************************************
    // find document
    // *********************************************************************************************

    /**
     * Retrieve the document. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param documentId the id of the document
     *
     * @return the document if found
     *
     * @throws HttpErrorMessage if the document was not found
     */
    public Document assertAndGetDocument(Long documentId) {
        Document document = documentDao.findDocument(documentId);

        if (document == null) {
            logger.error("document #{} not found", documentId);
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_NOT_FOUND);
        }

        return document;
    }

    /**
     * Retrieve the text data block. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param textDataBlockId the id of the text data block
     *
     * @return the text data block if found
     *
     * @throws HttpErrorMessage if the text data block was not found
     */
    public TextDataBlock assertAndGetTextDataBlock(Long textDataBlockId) {
        Document document = documentDao.findDocument(textDataBlockId);

        if (!(document instanceof TextDataBlock)) {
            logger.error("#{} is not a text data block", document);
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_NOT_FOUND);
        }

        return (TextDataBlock) document;

    }

    /**
     * Retrieve the list of documents the given document is part of
     *
     * @param document the document
     *
     * @return the list of documents the given document is part of
     *
     * @throws HttpErrorMessage If no collection could be found
     */
    public List<Document> getDocumentList(Document document) {
        if (document.hasOwningCardContent()) {
            return document.getOwningCardContent().getDeliverables();

        } else if (document.hasOwningResource()) {
            return document.getOwningResource().getDocuments();
        }

        throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
    }

    // *********************************************************************************************
    // move document
    // *********************************************************************************************

    /**
     * Move the document to the top
     *
     * @param documentId the id of the document to move
     */
    public void moveDocumentToTop(Long documentId) {
        logger.debug("move document #{} at top", documentId);

        Document document = assertAndGetDocument(documentId);
        List<Document> docList = getDocumentList(document);

        indexGenerator.moveItemToBeginning(document, docList);

    }

    /**
     * Move the given document one floor up
     *
     * @param documentId the id of the document to move
     */
    public void moveDocumentUp(Long documentId) {
        logger.debug("move document #{} up", documentId);

        Document document = assertAndGetDocument(documentId);
        List<Document> docList = getDocumentList(document);

        indexGenerator.moveOneStepAhead(document, docList);
    }

    /**
     * Move the given document above the given reference item
     *
     * @param documentId the id of the document to move
     * @param baseDocId  the id of the reference document
     */
    public void moveDocumentAbove(Long documentId, Long baseDocId) {
        logger.debug("move document #{} above #{}", documentId, baseDocId);

        Document document = assertAndGetDocument(documentId);

        Document baseDocument = assertAndGetDocument(baseDocId);
        List<Document> docList = getDocumentList(baseDocument);

        indexGenerator.moveItemBefore(document, baseDocument, docList);

    }

    /**
     * Move the given document one floor down
     *
     * @param documentId the id of the document to move
     */
    public void moveDocumentDown(Long documentId) {
        logger.debug("move document #{} down", documentId);

        Document document = assertAndGetDocument(documentId);
        List<Document> docList = getDocumentList(document);

        indexGenerator.moveOneStepBehind(document, docList);
    }

    /**
     * Move the given document below the given reference item.
     *
     * @param documentId the id of the document to move
     * @param baseDocId  the id of the reference document
     */
    public void moveDocumentBelow(Long documentId, Long baseDocId) {
        logger.debug("move document #{} below #{}", documentId, baseDocId);

        Document document = assertAndGetDocument(documentId);

        Document baseDocument = assertAndGetDocument(baseDocId);
        List<Document> docList = getDocumentList(baseDocument);

        indexGenerator.moveItemAfter(document, baseDocument, docList);
    }

    /**
     * Move the document to the bottom
     *
     * @param documentId the id of the document to move
     */
    public void moveDocumentToBottom(Long documentId) {
        logger.debug("move document #{} at bottom", documentId);

        Document document = assertAndGetDocument(documentId);
        List<Document> docList = getDocumentList(document);

        indexGenerator.moveItemToEnd(document, docList);
    }

    // *********************************************************************************************
    // integrity check
    // *********************************************************************************************

    /**
     * Check the integrity of the document
     *
     * @param document the document to check
     *
     * @return true iff the document is complete and safe
     */
    public boolean checkIntegrity(Document document) {
        if (document == null) {
            return false;
        }

        if (countOwners(document) != 1) {
            return false;
        }

        return true;
    }

    /**
     * Count the number of entities owning the document. It should be only one.
     *
     * @param document the document to check
     *
     * @return the number of owning entities
     */
    protected int countOwners(Document document) {
        int result = 0;

        if (document.hasOwningCardContent()) {
            result++;
        }

        if (document.hasOwningResource()) {
            result++;
        }

        if (document instanceof TextDataBlock) {
            TextDataBlock block = (TextDataBlock) document;

            if (block.getPurposingCardType() != null) {
                result++;
            }

            if (block.getTeasingResource() != null) {
                result++;
            }

            if (block.getExplainingStickyNoteLink() != null) {
                result++;
            }
        }

        return result;
    }

    // *********************************************************************************************
    // retrieve the elements linked to documents
    // *********************************************************************************************

    /**
     * Get all sticky note links of which the given document is the source
     *
     * @param docId the id of the document
     *
     * @return all sticky note links which has the given document as source
     */
    public List<StickyNoteLink> getStickyNoteLinkAsSrc(Long docId) {
        logger.debug("get sticky note links where the document #{} is the source", docId);

        Document document = assertAndGetDocument(docId);

        return document.getStickyNoteLinksAsSrc();
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

    // As a document is either linked to a resource or to a card content, most of
    // the operations are
    // made from there

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
