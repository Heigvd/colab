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
 * A message to propagate micro changes.
 *
 * @author maxence
 */
public class WsUpdateChangeMessage extends WsMessage {

    private static final long serialVersionUID = 1L;

    /**
     * List of changes
     */
    private final Collection<Change> payload = new ArrayList<>();

    /**
     * Build a message
     *
     * @param payload list of changes
     *
     * @return the message
     */
    public static WsUpdateChangeMessage build(Collection<Change> payload) {
        WsUpdateChangeMessage msg = new WsUpdateChangeMessage();
        msg.payload.addAll(payload);
        return msg;
    }

    /**
     * Get list of changes
     *
     * @return changes
     */
    public Collection<Change> getPayload() {
        return payload;
    }

}
