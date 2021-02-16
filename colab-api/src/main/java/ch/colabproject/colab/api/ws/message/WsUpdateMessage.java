/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import ch.colabproject.colab.api.model.WithId;
import java.util.Collection;

/**
 * Websocket update message. Contains list of new or updated object
 *
 * @author maxence
 */
public class WsUpdateMessage extends WsMessage {

    /**
     * List of new or updated objects
     */
    private final Collection<WithId> payload;

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

}
