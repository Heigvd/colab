/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import javax.validation.constraints.NotNull;

/**
 * Message sent to each client as soon as they initialize the websocket connection.
 *
 * @author maxence
 */
public class WsSessionIdentifier extends WsMessage {

    private static final long serialVersionUID = 1L;

    /**
     * Unique session ID
     */
    @NotNull
    private String sessionId;

    /**
     * Default constructor
     */
    public WsSessionIdentifier() {
        /* no-op */
    }

    /**
     * create a message based on a websocket session
     *
     * @param sessionId client session id
     */
    public WsSessionIdentifier(String sessionId) {
        this.sessionId = sessionId;
    }

    /**
     * @return the socket ID to send to the client
     */
    public String getSessionId() {
        return sessionId;
    }

    /**
     * Set session id
     *
     * @param sessionId session id
     */
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    @Override
    public String toString() {
        return "WsSessionIdentifier{" + "sessionId=" + sessionId + '}';
    }
}
