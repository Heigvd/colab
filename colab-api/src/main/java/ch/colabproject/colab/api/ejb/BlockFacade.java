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
import java.util.List;
import java.util.Optional;
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

    /**
     * Default room between indexes
     */
    private static final int DEFAULT_INDEX_INC = 1000;

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
        List<Block> blocks = blockDocument.getBlocks();
        if (blocks.isEmpty()) {
            block.setIndex(0);
        } else {
            Optional<Block> endBlock = blocks.stream().max((a, b) -> {
                if (a != null) {
                    if (b != null) {
                        return Math.max(a.getIndex(), b.getIndex());
                    } else {
                        // a is not null, b is null
                        return -1;
                    }
                } else if (b != null) {
                    // a is null, not b
                    return 1;
                }
                //both are null
                return 0;
            });
            if (endBlock.isPresent()) {
                Block end = endBlock.get();
                if (end.getIndex() > Long.MAX_VALUE - DEFAULT_INDEX_INC) {
                    block.setIndex(end.getIndex() + DEFAULT_INDEX_INC);
                } else {
                    // MAX INDEX reached -> reset all indexes
                    // TODO: current behaviour is not that robust...
                    // it will crash when there is more than (MAX_LONG / 1000) blocks
                    // anyway, such a document must be quite unreadable...
                    int index = 0;
                    for (Block b : blocks) {
                        b.setIndex(index);
                        index += DEFAULT_INDEX_INC;
                    }
                    block.setIndex(index);
                }
            } else {
                block.setIndex(0);
            }
        }
        blocks.add(block);

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

        TextDataBlock block = new TextDataBlock();
        block.setRevision("0");

        block.setDocument(blockDocument);
        (blockDocument).getBlocks().add(block);

        return blockDao.persistBlock(block);
    }

}
