/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.microchanges.live.monitoring;

import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import javax.validation.constraints.NotNull;

/**
 * Admin tool to monitor live block changes
 *
 * @author maxence
 */
@ExtractJavaDoc
public class BlockMonitoring {

    /**
     * Status of the block
     */
    public enum BlockStatus {
        /** everything looks fine */
        HEALTHY,
        /** pending changes are inconsistent */
        UNHEALTHY,
        /** unable to restore data from live cache */
        DATA_ERROR,
        /** no pending changes */
        PROCESSED,
        /** some
         * pending changes exist but block has been deleted in the meantime */
        DELETED;
    }

    /** Id of the block being live-edited */
    @NotNull
    private Long blockId;

    /** Human readable description */
    @NotNull
    private String title;

    /** Status of the live edition */
    @NotNull
    private BlockStatus status;

    /**
     * Get id
     *
     * @return the id of the block
     */
    public Long getBlockId() {
        return blockId;
    }

    /**
     * set block id
     *
     * @param blockId new block id
     */
    public void setBlockId(Long blockId) {
        this.blockId = blockId;
    }

    /**
     * status of the live-edition
     *
     * @return the status
     */
    public BlockStatus getStatus() {
        return status;
    }

    /**
     * set status
     *
     * @param status the status
     */
    public void setStatus(BlockStatus status) {
        this.status = status;
    }

    /**
     * Get human description
     *
     * @return the description
     */
    public String getTitle() {
        return title;
    }

    /**
     * Set human description
     *
     * @param title new text
     */
    public void setTitle(String title) {
        this.title = title;
    }
}
