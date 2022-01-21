/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.BlockDocument;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.jpa.document.BlockDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
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
     * The value of the first index
     */
    private static final int MIN_INDEX = 0;

    /**
     * The value of the bigger index that is compatible with the model
     */
    private static final int MAX_INDEX = Integer.MAX_VALUE;

    /**
     * Default room between indexes
     */
    private static final int DEFAULT_INDEX_INC = 1000;

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Block persistence handler
     */
    @Inject
    private BlockDao blockDao;

    /**
     * Document specific logic management
     */
    @Inject
    private DocumentManager documentManager;

    // *********************************************************************************************
    // find blocks
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
    public Block assertAndGetBlock(Long blockId) {
        Block block = blockDao.findBlock(blockId);

        if (block == null) {
            logger.error("block #{} not found", blockId);
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return block;
    }

    /**
     * Assert that the block is not null. If not throw a {@link HttpErrorMessage}.
     *
     * @param block the block to check
     *
     * @throws HttpErrorMessage if the block is null
     */
    public void assertBlock(Block block) {
        if (block == null) {
            logger.error("block {} not found", block);
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
    }

    // *********************************************************************************************
    // life cycle
    // *********************************************************************************************

    /**
     * Complete and persist the given new block
     *
     * @param block the block to persist
     *
     * @return the new persisted block
     */
    public Block createBlock(Block block) {
        logger.debug("create the block : {}", block);

        BlockDocument blockDocument = documentManager.assertAndGetBlockDocument(block.getDocumentId());

        block.setDocument(blockDocument);

        List<Block> blocks = blockDocument.getBlocks();
        if (blocks.isEmpty()) {
            block.setIndex(MIN_INDEX);
        } else {
            blocks.sort((a, b) -> {
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
            Block endBlock = blocks.get(blocks.size() - 1);
            if (endBlock.getIndex() < MAX_INDEX - DEFAULT_INDEX_INC) {
                block.setIndex(endBlock.getIndex() + DEFAULT_INDEX_INC);
            } else if (blocks.size() > (MAX_INDEX - MIN_INDEX) / DEFAULT_INDEX_INC) {
                // current behaviour is not that robust...
                // it will crash when there is more than (MAX_INTEGER / 1000) blocks
                // anyway, such a document must be quite unreadable...
                throw HttpErrorMessage.dataIntegrityFailure();
            } else {
                logger.warn("needed to reindex the blocks of the document {}", blockDocument);
                // MAX INDEX reached -> reset all indexes
                int index = MIN_INDEX;
                for (Block b : blocks) {
                    b.setIndex(index);
                    index += DEFAULT_INDEX_INC;
                }
                block.setIndex(index);
            }
        }
        blocks.add(block);

        return blockDao.persistBlock(block);
    }

    /**
     * Delete the given block
     *
     * @param blockId the id of the block to delete
     */
    public void deleteBlock(Long blockId) {
        logger.debug("delete the block #{}", blockId);

        Block block = assertAndGetBlock(blockId);

        BlockDocument blockDocument = block.getDocument();
        documentManager.assertBlockDocument(blockDocument);

        blockDocument.getBlocks().remove(block);

        blockDao.deleteBlock(blockId);
    }

    // *********************************************************************************************
    // text data blocks life cycle
    // *********************************************************************************************

    /**
     * Complete and persist a brand new text data block for a document
     *
     * @param documentId id of the document the block belongs to
     *
     * @return a new, initialized and persisted text data block
     */
    // TODO no effective use. To destroy during RestEndpoint cleaning
    public Block createTextDataBlock(Long documentId) {
        logger.debug("create a new block for the document #{}", documentId);

        TextDataBlock block = new TextDataBlock();
        block.setRevision("0");
        block.setDocumentId(documentId);

        return createBlock(block);
    }

    // *********************************************************************************************
    // retrieve the elements linked to blocks
    // *********************************************************************************************

    /**
     * Get all sticky note links of which the given block is the source
     *
     * @param blockId the id of the block
     *
     * @return all blocks source of sticky note links
     */
    public List<StickyNoteLink> getStickyNoteLinkAsSrc(Long blockId) {
        logger.debug("get sticky note links where the block #{} is the source", blockId);

        Block block = assertAndGetBlock(blockId);

        return block.getStickyNoteLinksAsSrc();
    }

    // *********************************************************************************************
    // integrity check
    // *********************************************************************************************

    /**
     * Check the integrity of the block
     *
     * @param block the block to check
     *
     * @return true iff the block is complete and safe
     */
    public boolean checkIntegrity(Block block) {
        if (block == null) {
            return false;
        }

        if (block.getDocument() == null && block.getDocumentId() == null) {
            return false;
        }

        return true;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
