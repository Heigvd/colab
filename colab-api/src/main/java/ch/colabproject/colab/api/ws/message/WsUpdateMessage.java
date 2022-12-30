/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import java.util.HashSet;
import java.util.Set;
import javax.validation.constraints.NotNull;

/**
 * Websocket update message. Contains a list of new or updated objects and a list of destroyed objects.
 *
 * @author maxence
 */
@ExtractJavaDoc
public class WsUpdateMessage extends WsMessage {

    private static final long serialVersionUID = 1L;

    /**
     * Set of new or updated objects
     */
    @NotNull
    private Set<WithWebsocketChannels> updated;

    /**
     * Set of destroyed objects
     */
    @NotNull
    private Set<IndexEntry> deleted;

    /**
     * Default constructor
     */
    public WsUpdateMessage() {
        this.updated = new HashSet<>();
        this.deleted = new HashSet<>();
    }

    /**
     * @return the list of new or updated objects to send to clients
     */
    public Set<WithWebsocketChannels> getUpdated() {
        return updated;
    }

    /**
     * Set payload
     *
     * @param updated list of updated elements
     */
    public void setUpdated(Set<WithWebsocketChannels> updated) {
        this.updated = updated;
    }

    /**
     * Get the list of deleted objects
     *
     * @return all deleted objects
     */
    public Set<IndexEntry> getDeleted() {
        return deleted;
    }

    /**
     * Register index of deleted objects
     *
     * @param deleted index
     */
    public void setDeleted(Set<IndexEntry> deleted) {
        this.deleted = deleted;
    }

    @Override
    public String toString() {
        return "WsUpdateMessage{" + "updated=" + updated + ", deleted=" + deleted + '}';
    }
}
