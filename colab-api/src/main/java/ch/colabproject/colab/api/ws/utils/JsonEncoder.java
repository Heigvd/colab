/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.utils;

import ch.colabproject.colab.api.rest.config.JsonbProvider;
import ch.colabproject.colab.api.ws.message.WsMessage;
import javax.json.bind.Jsonb;
import javax.json.bind.JsonbException;
import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

/**
 * Serialize object as JSON using JSONb
 *
 * @author maxence
 */
public class JsonEncoder implements Encoder.Text<WsMessage> {

    /**
     * Serialize object using {@link JsonbProvider#getJsonb() }
     *
     * @param object object to serialize
     *
     * @return JSON-serialized object
     *
     * @throws EncodeException if error
     */
    @Override
    public String encode(WsMessage object) throws EncodeException {
        try {
            Jsonb jsonb = JsonbProvider.getJsonb();
            return jsonb.toJson(object);
        } catch (JsonbException ex) {
            throw new EncodeException(object, ex.getMessage());
        }
    }

    /**
     * {@inheritDoc }
     */
    @Override
    public void init(EndpointConfig config) {
        /* no-op */
    }

    /**
     * {@inheritDoc }
     */
    @Override
    public void destroy() {
        /* no-op */
    }

}
