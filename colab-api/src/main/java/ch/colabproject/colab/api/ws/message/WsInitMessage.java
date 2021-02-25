/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import javax.websocket.Session;

/**
 * Message sent to each client as soon as they initialize the websocket connection.
 *
 * @author maxence
 */
public class WsInitMessage extends WsMessage {

    private static final long serialVersionUID = 1L;

    /**
     * Unique session ID TODO: check uniqueness through the cluster
     */
    private final String sessionId;

    /**
     * create a message based on a websocket session
     *
     * @param session client session
     */
    public WsInitMessage(Session session) {
        this.sessionId = session.getId();
    }

    /**
     * @return the socket ID to send to the client
     */
    public String getSessionId() {
        return sessionId;
    }
}
