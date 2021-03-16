/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import ch.colabproject.colab.api.model.WithId;
import java.util.ArrayList;
import java.util.Collection;
import javax.validation.constraints.NotNull;

/**
 * Websocket update message. Contains list of new or updated object
 *
 * @author maxence
 */
public class WsUpdateMessage extends WsMessage {

    private static final long serialVersionUID = 1L;

    /**
     * List of new or updated objects
     */
    @NotNull
    private Collection<WithId> payload;

    /**
     * Default constructor
     */
    public WsUpdateMessage() {
        this.payload = new ArrayList<>();
    }

    /**
     * Create a message based on a list of new or updated objects
     *
     * @param payload list of objects
     */
    public WsUpdateMessage(Collection<WithId> payload) {
        this.payload = payload;
    }

    /**
     * @return the list of new or updated objects to send to clients
     */
    public Collection<WithId> getPayload() {
        return payload;
    }

    /**
     * Set paylosd
     *
     * @param payload list of updated elements
     */
    public void setPayload(Collection<WithId> payload) {
        this.payload = payload;
    }
}
