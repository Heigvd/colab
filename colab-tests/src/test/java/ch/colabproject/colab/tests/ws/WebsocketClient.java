/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.ws;

import ch.colabproject.colab.api.ws.message.WsMessage;
import ch.colabproject.colab.api.ws.message.WsSessionIdentifier;
import ch.colabproject.colab.api.ws.utils.JsonDecoder;
import ch.colabproject.colab.api.ws.utils.JsonEncoder;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import javax.websocket.ClientEndpoint;
import javax.websocket.CloseReason;
import javax.websocket.ContainerProvider;
import javax.websocket.DeploymentException;
import javax.websocket.EncodeException;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.WebSocketContainer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author maxence
 */
@ClientEndpoint(encoders = JsonEncoder.class, decoders = JsonDecoder.class)
public class WebsocketClient {

    private static final Logger logger = LoggerFactory.getLogger(WebsocketClient.class);

    private CountDownLatch latch = null;

    private List<WsMessage> received = new ArrayList<>();

    private Session session = null;

    private WsSessionIdentifier sessionId;

    /**
     * Please use {@link #build(java.lang.String) dedicated builder}
     */
    private WebsocketClient() {
        /* private prevents instantion from outside */
    }

    /**
     * Callback hook for Connection open events.
     *
     * @param session client session
     */
    @OnOpen
    public void onOpen(Session session) {
        logger.debug("Session opened: {}", session.getId());
        this.session = session;
    }

    /**
     * On close callback
     *
     * @param session the session
     * @param reason  the reason
     */
    @OnClose
    public void onClose(Session session, CloseReason reason) {
        logger.debug("Session closed: {}", reason);
        this.session = null;
    }

    /**
     * On message callback.
     *
     * @param message the message
     */
    @OnMessage
    public void onMessage(WsMessage message) {
        logger.debug("Receive message: {}", message);
        synchronized (this) {
            logger.trace("Receive message synchronized: {}", message);
            this.received.add(message);
            logger.trace("{} message are available", received.size());

            if (this.latch != null) {
                long count = latch.getCount();
                this.latch.countDown();
                logger.trace("Count down : {} to {}", count, latch.getCount());
            } else {
                logger.trace("Nobody is waiting");
            }
        }
    }

    /**
     * Send a message.
     *
     * @param message the message to send
     *
     * @throws java.io.IOException             failed to send the message
     * @throws javax.websocket.EncodeException websocket error
     */
    public void sendMessage(WsMessage message) throws IOException, EncodeException {
        this.session.getBasicRemote().sendObject(message);
    }

    /**
     * wait until client received {@code numberOfExpectedMessages} messages.
     *
     * @param numberOfExpectedMessages number of expected messages
     * @param timeout                  stop waiting after this amount of second
     *
     * @return list of messages
     */
    public List<WsMessage> getMessages(int numberOfExpectedMessages, int timeout) {
        logger.debug("Wait for {} mesages", numberOfExpectedMessages);
        if (latch == null) {
            logger.trace("No latch");
            synchronized (this) {
                if (received.size() >= numberOfExpectedMessages) {
                    logger.trace("No need to wait, {} are available yet", received.size());
                    List<WsMessage> messages = List.copyOf(received);
                    received.clear();
                    return messages;
                } else {
                    int missing = numberOfExpectedMessages - received.size();
                    logger.trace("Need to wait, only {}/{} are available yet ({} missing)", received.size(), numberOfExpectedMessages, missing);
                    this.latch = new CountDownLatch(numberOfExpectedMessages - received.size());
                }
            }
            try {
                logger.trace("Wait");
                this.latch.await(timeout, TimeUnit.SECONDS);
                logger.trace("Latch is open: {}", latch.getCount());
            } catch (InterruptedException ex) {
                logger.trace("Interrupted");
            }
            synchronized (this) {
                logger.trace("Get all messages and clear received");
                List<WsMessage> messages = List.copyOf(received);
                received.clear();
                this.latch = null;
                return messages;
            }
        } else {
            logger.error("Latch already set !! Error !");
            return List.of();
        }
    }

    public WsSessionIdentifier getSessionId() {
        return this.sessionId;
    }

    private void setSessionId(WsSessionIdentifier sessionId) {
        this.sessionId = sessionId;
    }

    /**
     * Clear received messages
     */
    public void clearMessages() {
        synchronized (this) {
            this.received.clear();
        }
    }

    public void close() throws IOException {
        this.session.close(new CloseReason(CloseReason.CloseCodes.GOING_AWAY, "Bye bye"));
    }

    public static WebsocketClient build(String endpoint) throws DeploymentException, IOException, URISyntaxException, InterruptedException {
        WebsocketClient client = new WebsocketClient();
        URI uri = new URI(endpoint);

        WebSocketContainer container = ContainerProvider.getWebSocketContainer();
        container.connectToServer(client, uri);
        List<WsMessage> messages = client.getMessages(1, 5);

        if (messages.size() != 1) {
            throw new IOException("Websocket initialization failed. Number of messages: " + messages.size());
        }

        WsMessage message = messages.get(0);
        if (message instanceof WsSessionIdentifier) {
            client.setSessionId(((WsSessionIdentifier) message));
        } else {
            throw new IOException("Received message is not of type WsSessionIdentifier");
        }

        return client;
    }
}
