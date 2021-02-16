/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws;

import ch.colabproject.colab.api.model.WithId;
import ch.colabproject.colab.api.ws.utils.JsonDecoder;
import ch.colabproject.colab.api.ws.utils.JsonEncoder;
import ch.colabproject.colab.api.ws.message.WsDeleteMessage;
import ch.colabproject.colab.api.ws.message.WsDeleteMessage.IndexEntry;
import ch.colabproject.colab.api.ws.message.WsInitMessage;
import ch.colabproject.colab.api.ws.message.WsMessage;
import ch.colabproject.colab.api.ws.message.WsUpdateMessage;
import java.io.IOException;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import javax.websocket.CloseReason;
import javax.websocket.EncodeException;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Websocket endpoint
 *
 * @author maxence
 */
@ServerEndpoint(value = "/ws", encoders = JsonEncoder.class, decoders = JsonDecoder.class)
public class WebsocketEndpoint {

    /**
     * Logger
     */
    private static final Logger LOG = LoggerFactory.getLogger(WebsocketEndpoint.class);

    /**
     * Map of active sessions
     */
    private static Set<Session> sessions = Collections.synchronizedSet(new HashSet<Session>());

    /**
     * Send a message to all clients
     *
     * @param message the message to send
     */
    public static void broadcastMessage(WsMessage message) {
        for (Session session : sessions) {
            try {
                session.getBasicRemote().sendObject(message);
            } catch (IOException | EncodeException e) {
                LOG.error("Broadcast message exception: {}", e);
            }
        }
    }

    /**
     * On new connection. Send back a WsInitMessage to let the client known it's own sessionId
     *
     * @param session brand new session
     *
     * @throws IOException     if sending the initMessage fails
     * @throws EncodeException if sending the initMessage fails
     */
    @OnOpen
    public void onOpen(Session session) throws IOException, EncodeException {
        LOG.info("WebSocket opened: {}", session.getId());
        sessions.add(session);
        session.getBasicRemote().sendObject(new WsInitMessage(session));
    }

    /**
     * called when client send messages
     *
     * @param message message received from client
     * @param session client session
     */
    @OnMessage
    public void onMessage(WsMessage message, Session session) {
        LOG.info("Message received: {} from {}", message, session.getId());
    }

    /**
     * TO handle errors. TBD TODO
     *
     * @param session   erroneous session
     * @param throwable error
     */
    @OnError
    public void onError(Session session, Throwable throwable) {
        LOG.info("WebSocket error for {} {}", session.getId(), throwable.getMessage());
    }

    /**
     * When a client is leaving
     *
     * @param session     session to close
     * @param closeReason some reason...
     */
    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        LOG.info("WebSocket closed for {} with reason {}", session.getId(), closeReason.getCloseCode());
        sessions.remove(session);
    }

    /**
     * Send update to all clients
     *
     * @param o list of new or updated object to send
     */
    public static void propagate(Collection<WithId> o) {
        broadcastMessage(new WsUpdateMessage(o));
    }

    /**
     * Send deleted info to client
     *
     * @param o list of deleted object
     */
    public static void propagateDeletion(Collection<IndexEntry> o) {
        broadcastMessage(new WsDeleteMessage(o));
    }
}
