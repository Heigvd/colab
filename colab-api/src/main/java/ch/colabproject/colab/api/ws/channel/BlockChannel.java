/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.channel;

import ch.colabproject.colab.api.model.document.TextDataBlock;
import java.util.Objects;

/**
 * A channel to propagate content of a given blockId.
 *
 * @author maxence
 */
public class BlockChannel implements WebsocketEffectiveChannel {

    private static final long serialVersionUID = 1L;

    /**
     * id of the block this channel is about.
     */
    private Long blockId;

    /**
     * ID of the block this channel is about
     *
     * @return the blockId
     */
    public Long getBlockId() {
        return blockId;
    }

    /**
     * Set the blockId
     *
     * @param blockId new blockId
     */
    public void setBlockId(Long blockId) {
        this.blockId = blockId;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 53 * hash + Objects.hashCode(this.blockId);
        return hash;
    }

    /**
     * Channel equals if they both refer to the same blockId
     *
     * @param obj other channel
     *
     * @return true if both ContentChannel refer to the same blockId
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final BlockChannel other = (BlockChannel) obj;

        return Objects.equals(this.blockId, other.blockId);
    }

    @Override
    public String toString() {
        return "BlockChannel{" + "blockId=" + this.blockId + '}';
    }

    /**
     * get the channel dedicated to the given block.
     *
     * @param block the block
     *
     * @return the block very own channel
     */
    public static BlockChannel build(TextDataBlock block) {
        return build(block.getId());
    }

    /**
     * get the channel dedicated to the block having the given id.
     *
     * @param blockId id of the block
     *
     * @return the block very own channel
     */
    public static BlockChannel build(Long blockId) {
        BlockChannel channel = new BlockChannel();
        channel.setBlockId(blockId);
        return channel;
    }
}
