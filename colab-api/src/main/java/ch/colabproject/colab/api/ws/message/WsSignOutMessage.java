/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import ch.colabproject.colab.api.model.user.HttpSession;
import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import javax.validation.constraints.NotNull;

/**
 * Websocket message to inform about a logout.
 *
 * @author sandra
 */
@ExtractJavaDoc
public class WsSignOutMessage extends WsMessage {

    private static final long serialVersionUID = 1L;

    /**
     * Http session
     */
    @NotNull
    private HttpSession session;

    /**
     * Default constructor
     */
    public WsSignOutMessage() {
        /* no-op */
    }

    /**
     * create a message based on an http session
     *
     * @param session http session
     */
    public WsSignOutMessage(HttpSession session) {
        this.session = session;
    }

    /**
     * @return the http session
     */
    public HttpSession getSession() {
        return session;
    }

    /**
     * @param session the http session
     */
    public void setSession(HttpSession session) {
        this.session = session;
    }

    @Override
    public String toString() {
        return "WsSignOutMessage{"+ "session="+ session + "}";
    }
}
