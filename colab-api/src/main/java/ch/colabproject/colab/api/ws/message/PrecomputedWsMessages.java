/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import ch.colabproject.colab.api.ws.channel.WebsocketEffectiveChannel;
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
    private Map<WebsocketEffectiveChannel, List<String>> messages;

    /**
     * Get messages that should be sent.
     *
     * @return all messages, mapped by channel
     */
    public Map<WebsocketEffectiveChannel, List<String>> getMessages() {
        return messages;
    }

    /**
     * Set messages to send
     *
     * @param messages list of messages, map by their channels
     */
    public void setMessages(Map<WebsocketEffectiveChannel, List<String>> messages) {
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
        Map<WebsocketEffectiveChannel, List<WsMessage>> messages
    ) throws EncodeException {
        PrecomputedWsMessages m = new PrecomputedWsMessages();
        m.setMessages(new HashMap<>());
        Map<WebsocketEffectiveChannel, List<String>> encoded = m.getMessages();
        if (messages != null) {
            // TODO: is there a way to throw exception from lambda ?
            for (var entry : messages.entrySet()) {
                var wsMessages = entry.getValue();
                var encodedMessages = new ArrayList<String>(wsMessages.size());
                for (var wsMessage : wsMessages) {
                    encodedMessages.add(JsonEncoder.toJson(wsMessage));
                }
                encoded.put(entry.getKey(), encodedMessages);
            }
        }
        return m;
    }
}
