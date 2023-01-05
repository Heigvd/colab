/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;

/**
 * Ping message
 *
 * @author maxence
 */
@ExtractJavaDoc
public class WsPing extends WsMessage {

    private static final long serialVersionUID = 1L;

    /**
     * Default constructor
     */
    public WsPing() {
        /* no-op */
    }

    @Override
    public String toString() {
        return "WsPing";
    }
}
