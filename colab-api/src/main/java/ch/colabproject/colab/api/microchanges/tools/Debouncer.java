/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.microchanges.tools;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.ejb.CdiBridgeSingleton;
import java.io.Serializable;
import java.util.concurrent.Callable;

/**
 * Callable Change processing Request.
 *
 * @author maxence
 */
public class Debouncer implements Callable<Void>, Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * if of the block to process
     */
    private Long blockId;

    /**
     * Create a debouncer for the given block id
     *
     * @param blockId id of the block
     */
    public Debouncer(Long blockId) {
        this.blockId = blockId;
    }

    @Override
    public Void call() throws Exception {
        Thread.sleep(5000);

        CdiBridgeSingleton cdiBridge = Helper.lookup(CdiBridgeSingleton.class);
        cdiBridge.processMicroChanges(blockId);
        return null;
    }
}
