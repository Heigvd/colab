/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.BlockDocument;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.persistence.document.BlockDao;
import ch.colabproject.colab.api.persistence.document.DocumentDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Blocks specific logic
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class BlockFacade {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(BlockFacade.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Block persistence handling
     */
    @Inject
    private BlockDao blockDao;

    /**
     * Document persistence handling
     */
    @Inject
    private DocumentDao documentDao;

    /**
     * To check access rights
     */
    @Inject
    private SecurityFacade securityFacade;

    // *********************************************************************************************
    // general block stuff
    // *********************************************************************************************

    /**
     * Persist the new block
     *
     * @param block the block to persist
     *
     * @return the new persisted block
     */
    public Block persistBlock(Block block) {
        logger.debug("persist the block {}", block);

        Document document = documentDao.findDocument(block.getDocumentId());
        if (!(document instanceof BlockDocument)) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        BlockDocument blockDocument = (BlockDocument) document;
        securityFacade.assertCanCreateBlock(blockDocument);

        block.setDocument(blockDocument);
        blockDocument.getBlocks().add(block);

        return blockDao.persistBlock(block);
    }

    // *********************************************************************************************
    // text data block stuff
    // *********************************************************************************************

    /**
     * Create a brand new block for a document
     *
     * @param documentId id of the document the block belongs to
     *
     * @return a new, initialized and persisted text data block
     */
    public Block createNewTextDataBlock(Long documentId) {
        logger.debug("create a new block for the document #{}", documentId);

        Document document = documentDao.findDocument(documentId);
        if (!(document instanceof BlockDocument)) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        BlockDocument blockDocument = (BlockDocument) document;
        securityFacade.assertCanCreateBlock(blockDocument);

        Block block = new TextDataBlock();

        block.setDocument(blockDocument);
        (blockDocument).getBlocks().add(block);

        return blockDao.persistBlock(block);
    }

}
