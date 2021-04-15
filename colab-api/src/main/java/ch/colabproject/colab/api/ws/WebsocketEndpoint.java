/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws;

import ch.colabproject.colab.api.ejb.WebsocketFacade;
import ch.colabproject.colab.api.ws.message.WsMessage;
import ch.colabproject.colab.api.ws.message.WsSessionIdentifier;
import ch.colabproject.colab.api.ws.utils.JsonDecoder;
import ch.colabproject.colab.api.ws.utils.JsonEncoder;
import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
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
@ApplicationScoped
@ServerEndpoint(value = "/ws", encoders = JsonEncoder.class, decoders = JsonDecoder.class)
public class WebsocketEndpoint {

    /**
     * Websocket business logic.
     */
    @Inject
    private WebsocketFacade websocketFacade;

    /**
     * Logger
     */
    private static final Logger logger = LoggerFactory.getLogger(WebsocketEndpoint.class);

    /**
     * Map of active sessions
     */
    private static Set<Session> sessions = Collections.synchronizedSet(new HashSet<>());

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
                logger.error("Broadcast message exception: {}", e);
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
        logger.info("WebSocket opened: {}", session.getId());
        sessions.add(session);
        session.getBasicRemote().sendObject(new WsSessionIdentifier(session));
    }

    /**
     * called when client send messages
     *
     * @param message message received from client
     * @param session client session
     */
    @OnMessage
    public void onMessage(WsMessage message, Session session) {
        logger.info("Message received: {} from {}", message, session.getId());
    }

    /**
     * TO handle errors. TBD TODO
     *
     * @param session   erroneous session
     * @param throwable error
     */
    @OnError
    public void onError(Session session, Throwable throwable) {
        logger.info("WebSocket error for {} {}", session.getId(), throwable.getMessage());
    }

    /**
     * When a client is leaving
     *
     * @param session     session to close
     * @param closeReason some reason...
     */
    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        logger.info("WebSocket closed for {} with reason {}",
            session.getId(), closeReason.getCloseCode());
        sessions.remove(session);
        websocketFacade.unsubscribeFromAll(session);
    }

    /**
     * Get session by its id
     *
     * @param sessionId id of the session
     *
     * @return the session or null
     */
    public static Session getSession(String sessionId) {
        Optional<Session> find = sessions.stream()
            .filter(session -> session.getId().equals(sessionId))
            .findFirst();
        if (find.isPresent()) {
            return find.get();
        } else {
            return null;
        }
    }
}
