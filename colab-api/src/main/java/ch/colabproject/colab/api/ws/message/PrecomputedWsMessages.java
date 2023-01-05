/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import ch.colabproject.colab.api.ws.channel.model.WebsocketChannel;
import ch.colabproject.colab.api.ws.utils.JsonEncoder;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.websocket.EncodeException;

/**
 * List of all WsMessages that should be sent through websockets. Messages are mapped with the
 * channel they should be sent through.
 *
 * @author maxence
 */
public class PrecomputedWsMessages implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Each channel has a list of json-encoded messages
     */
    private Map<WebsocketChannel, List<String>> messages;

    /**
     * Get messages that should be sent.
     *
     * @return all messages, mapped by channel
     */
    public Map<WebsocketChannel, List<String>> getMessages() {
        return messages;
    }

    /**
     * Set messages to send
     *
     * @param messages list of messages, map by their channels
     */
    public void setMessages(Map<WebsocketChannel, List<String>> messages) {
        this.messages = messages;
    }

    /**
     * Pre-compute all messages to send
     *
     * @param messages all messages
     *
     * @return the precomputed messages
     *
     * @throws EncodeException if something is not serializable.
     */
    public static PrecomputedWsMessages build(
        Map<WebsocketChannel, List<WsMessage>> messages
    ) throws EncodeException {
        PrecomputedWsMessages m = new PrecomputedWsMessages();
        m.setMessages(new HashMap<>());
        Map<WebsocketChannel, List<String>> encoded = m.getMessages();
        if (messages != null) {
            // TODO: is there a way to throw exception from lambda ?
            for (var messageEntry : messages.entrySet()) {
                var wsMessages = messageEntry.getValue();
                var encodedMessages = new ArrayList<String>(wsMessages.size());
                for (var wsMessage : wsMessages) {
                    encodedMessages.add(JsonEncoder.toJson(wsMessage));
                }
                encoded.put(messageEntry.getKey(), encodedMessages);
            }
        }
        return m;
    }

    @Override
    public String toString() {
        return "PrecomputedWsMessages{" + "messages=" + messages + '}';
    }
}
