/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import ch.colabproject.colab.api.model.ColabEntity;
import java.util.ArrayList;
import java.util.Collection;
import javax.validation.constraints.NotNull;

/**
 * Websocket update message. Contains list of new or updated object and list of destroyed entities.
 *
 * @author maxence
 */
public class WsUpdateMessage extends WsMessage {

    private static final long serialVersionUID = 1L;

    /**
     * Collection of new or updated objects
     */
    @NotNull
    private Collection<ColabEntity> updated;

    /**
     * Collection of destroyed entities
     */
    @NotNull
    private Collection<IndexEntry> deleted;

    /**
     * Default constructor
     */
    public WsUpdateMessage() {
        this.updated = new ArrayList<>();
        this.deleted = new ArrayList<>();
    }

    /**
     * @return the list of new or updated objects to send to clients
     */
    public Collection<ColabEntity> getUpdated() {
        return updated;
    }

    /**
     * Set paylosd
     *
     * @param updated list of updated elements
     */
    public void setUpdated(Collection<ColabEntity> updated) {
        this.updated = updated;
    }

    /**
     * Get the list of deleted entities
     *
     * @return all deleted entites
     */
    public Collection<IndexEntry> getDeleted() {
        return deleted;
    }

    public void setDeleted(Collection<IndexEntry> deleted) {
        this.deleted = deleted;
    }

}
