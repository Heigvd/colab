/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import ch.colabproject.colab.api.microchanges.model.Change;
import java.util.ArrayList;
import java.util.Collection;

/**
 * A message to propagate micro changes deletion. Deletion occurs when changes have been processed.
 *
 * @author maxence
 */
public class WsDeleteChangeMessage extends WsMessage {

    private static final long serialVersionUID = 1L;

    /**
     * List of changes that no longer exists
     */
    private final Collection<Change> payload = new ArrayList<>();

    /**
     * Create a message
     *
     * @param payload list of useless changes the client shall drop
     *
     * @return the message
     */
    public static WsDeleteChangeMessage build(Collection<Change> payload) {
        WsDeleteChangeMessage msg = new WsDeleteChangeMessage();
        msg.payload.addAll(payload);
        return msg;
    }

    /**
     * The changes
     * @return changes to drop
     */
    public Collection<Change> getPayload() {
        return payload;
    }

}
