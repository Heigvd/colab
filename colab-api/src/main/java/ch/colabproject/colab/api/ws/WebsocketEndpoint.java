/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.controller.WebsocketManager;
import ch.colabproject.colab.api.ws.message.WsMessage;
import ch.colabproject.colab.api.ws.message.WsPing;
import ch.colabproject.colab.api.ws.message.WsPong;
import ch.colabproject.colab.api.ws.message.WsSessionIdentifier;
import ch.colabproject.colab.api.ws.utils.JsonDecoder;
import ch.colabproject.colab.api.ws.utils.JsonEncoder;
import ch.colabproject.colab.api.ws.utils.JsonWsMessageListDecoder;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.flakeidgen.FlakeIdGenerator;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
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
@ServerEndpoint(value = "/ws", encoders = JsonEncoder.class, decoders = {JsonDecoder.class, JsonWsMessageListDecoder.class})
public class WebsocketEndpoint {

    /**
     * To generate cluster-wide unique id
     */
    @Inject
    private HazelcastInstance hzInstance;

    /**
     * Websocket business logic.
     */
    @Inject
    private WebsocketManager websocketManager;

    /**
     * Logger
     */
    private static final Logger logger = LoggerFactory.getLogger(WebsocketEndpoint.class);

    /**
     * Map of active sessions
     */
    private static Set<Session> sessions = Collections.synchronizedSet(new HashSet<>());

    /**
     * Map session to session id
     */
    private static Map<Session, String> sessionToIds = Collections.synchronizedMap(new HashMap<>());

    /**
     * Map session id to sessions
     */
    private static Map<String, Session> idsToSessions
        = Collections.synchronizedMap(new HashMap<>());

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
        FlakeIdGenerator idGenerator = hzInstance.getFlakeIdGenerator("WS_SESSION_ID_GENERATOR");
        String sessionId = "ws-" + Helper.generateHexSalt(8) + idGenerator.newId();
        sessionToIds.put(session, sessionId);
        idsToSessions.put(sessionId, session);
        session.getBasicRemote().sendObject(new WsSessionIdentifier(sessionId));

        long maxIdleTimeout = session.getMaxIdleTimeout();
        logger.trace("Session Timeout: {} ms", maxIdleTimeout);
    }

    /**
     * called when client send messages
     *
     * @param message message received from client
     * @param session client session
     */
    @OnMessage
    public void onMessage(WsMessage message, Session session) {
        logger.trace("Message received: {} from {}", message, session.getId());
        if (message instanceof WsPing) {
            try {
                session.getBasicRemote().sendObject(new WsPong());
            } catch (IOException | EncodeException ex) {
                logger.warn("Fail to reply to ping", ex);
            }
        }
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
        logger.info("WebSocket closed for {} with reason {}: {}",
            session.getId(), closeReason.getCloseCode(), closeReason.getReasonPhrase());
        sessions.remove(session);
        String id = sessionToIds.get(session);
        idsToSessions.remove(id);
        sessionToIds.remove(session);
        websocketManager.unsubscribeFromAll(session, id);
    }

    /**
     * Get session by its id
     *
     * @param sessionId id of the session
     *
     * @return the session or null
     */
    public static Session getSession(String sessionId) {
        return idsToSessions.get(sessionId);
    }

    /**
     * Get id by session
     *
     * @param session the session
     *
     * @return sessionid or null
     */
    public static String getSessionId(Session session) {
        return sessionToIds.get(session);
    }
}
