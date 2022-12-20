/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.persistence.jpa.document.DocumentDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import jakarta.ejb.LocalBean;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Block specific logic
 *
 * @author maxence
 * @author sandra
 */
@Stateless
@LocalBean
public class BlockManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(BlockManager.class);

    /**
     * The mime type by default
     */
    public static final String DEFAULT_MIME_TYPE = "text/markdown";

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Document persistence handler
     */
    @Inject
    private DocumentDao documentDao;

    /**
     * Document specific logic management
     */
    @Inject
    private DocumentManager documentManager;

    // *********************************************************************************************
    // life cycle
    // *********************************************************************************************

    /**
     * Retrieve the block. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param blockId the id of the block
     *
     * @return the block if found
     *
     * @throws HttpErrorMessage if the block was not found
     */
    public TextDataBlock assertAndGetTextDataBlock(Long blockId) {
        Document doc = documentManager.assertAndGetDocument(blockId);

        if (!(doc instanceof TextDataBlock)) {
            logger.error("document {} is not a text data block", doc);
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return ((TextDataBlock) doc);
    }

    // *********************************************************************************************
    // life cycle
    // *********************************************************************************************

    /**
     * @param id the id of the block to fetch
     *
     * @return the block with the given id or null if such a block does not exist
     */
    public TextDataBlock findBlock(Long id) {
        return documentDao.findTextDataBlock(id);
    }

    /**
     * Update block. Only fields which are editable by users will be impacted.
     *
     * @param block the block as supply by clients (ie not managed)
     *
     * @throws ColabMergeException if updating the block failed
     */
    public void updateBlock(TextDataBlock block) throws ColabMergeException {
        TextDataBlock managedDocument = documentManager.assertAndGetTextDataBlock(block.getId());

        managedDocument.merge(block);
    }

    /**
     * @return a new initialized text data block
     */
    public TextDataBlock makeNewTextDataBlock() {
        TextDataBlock newBlock = new TextDataBlock();
        newBlock.setMimeType(DEFAULT_MIME_TYPE);
        return newBlock;
    }

    // *********************************************************************************************
    // delete document
    // *********************************************************************************************

    /**
     * Delete the given block
     *
     * @param blockId the id of the block to delete
     */
    public void deleteTextDataBlock(Long blockId) {
        logger.debug("delete the block #{}", blockId);

        TextDataBlock block = assertAndGetTextDataBlock(blockId);

        if (!checkDeletionAcceptability(block)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        documentDao.deleteDocument(block);
    }

    /**
     * Ascertain that the block can be deleted.
     *
     * @param cardContent the block to check for deletion
     *
     * @return True iff it can be safely deleted
     */
    private boolean checkDeletionAcceptability(TextDataBlock block) {
        if (block.getPurposingCardType() != null) {
            return false;
        }

        if (block.getTeasingResource() != null) {
            return false;
        }

        if (block.getExplainingStickyNoteLink() != null) {
            return false;
        }

        return true;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
