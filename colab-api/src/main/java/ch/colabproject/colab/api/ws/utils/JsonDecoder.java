/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.utils;

import ch.colabproject.colab.api.ws.message.WsMessage;
import ch.colabproject.colab.generator.model.tools.JsonbProvider;
import java.io.StringReader;
import javax.json.Json;
import javax.json.JsonException;
import javax.json.JsonReader;
import javax.json.bind.Jsonb;
import javax.websocket.DecodeException;
import javax.websocket.Decoder;
import javax.websocket.EndpointConfig;

/**
 * Convert JSON-encoded Websocket message received from clients
 *
 * @author maxence
 */
public class JsonDecoder implements Decoder.Text<WsMessage> {

    /**
     * Parse message with {@link JsonbProvider#getJsonb()}
     *
     * @param s message received from a client
     *
     * @return revived message
     *
     * @throws DecodeException if message is not parseble
     */
    @Override
    public WsMessage decode(String s) throws DecodeException {
        Jsonb jsonb = JsonbProvider.getJsonb();
        return jsonb.fromJson(s, WsMessage.class);
    }

    /**
     * Is this decoder can handler the given message ?
     *
     * @param s the message to decode
     *
     * @return true if this decoder can handle the message, false otherwise
     */
    @Override
    public boolean willDecode(String s) {
        try (JsonReader jsonReader = Json.createReader(new StringReader(s))) {
            jsonReader.readObject();
            return true;
        } catch (JsonException e) {
            return false;
        }
    }

    /**
     * {@inheritDoc  }
     */
    @Override
    public void init(EndpointConfig config) {
        /* no-op */
    }

    /**
     * {@inheritDoc  }
     */
    @Override
    public void destroy() {
        /* no-op */
    }

}
