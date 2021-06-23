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
 * Cancel any {@link Debouncer}
 *
 * @author maxence
 */
public class CancelDebounce implements Callable<Boolean>, Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * If of the block
     */
    private final Long blockId;

    /**
     * Create the callable canceler
     *
     * @param blockId id of the block
     */
    public CancelDebounce(Long blockId) {
        this.blockId = blockId;
    }

    @Override
    public Boolean call() throws Exception {
        CdiBridgeSingleton cdiBridge = Helper.lookup(CdiBridgeSingleton.class);
        return cdiBridge.cancelDebounce(blockId);
    }
}
