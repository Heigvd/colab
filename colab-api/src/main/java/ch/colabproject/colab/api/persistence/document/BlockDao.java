/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.document.Block;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Block persistence
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class BlockDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(BlockDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * @param id the id of the block to fetch
     *
     * @return the block with the given id or null if such a block does not exists
     */
    public Block findBlock(Long id) {
        try {
            logger.debug("find block #{}", id);
            return em.find(Block.class, id);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    /**
     * Update block
     *
     * @param block the block as supply by clients (ie not managed)
     *
     * @return the updated managed block
     *
     * @throws ColabMergeException if updating the block failed
     */
    public Block updateBlock(Block block) throws ColabMergeException {
        logger.debug("update block {}", block);
        Block mBlock = this.findBlock(block.getId());
        mBlock.merge(block);
        return mBlock;
    }

    /**
     * Persist a brand new block to database
     *
     * @param block the new block to persist
     *
     * @return the new persisted block
     */
    public Block persistBlock(Block block) {
        logger.debug("persist block {}", block);
        em.persist(block);
        return block;
    }

    /**
     * Delete block from database. This can't be undone
     *
     * @param id the id of the block to delete
     *
     * @return just deleted block
     */
    public Block deleteBlock(Long id) {
        logger.debug("delete block #{}", id);
        // TODO: move to recycle bin first
        Block block = this.findBlock(id);
        em.remove(block);
        return block;
    }

}
