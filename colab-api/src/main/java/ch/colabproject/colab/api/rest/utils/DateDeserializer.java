/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.utils;

import java.lang.reflect.Type;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import javax.json.bind.serializer.DeserializationContext;
import javax.json.bind.serializer.JsonbDeserializer;
import javax.json.stream.JsonParser;

/**
 * Give JSONb ability to deserialize timestamps to LocalDateTime
 *
 * @author maxence
 * @deprecated use @JsonbDateFormat(value = JsonbDateFormat.TIME_IN_MILLIS)
 */
@Deprecated
public class DateDeserializer implements JsonbDeserializer<LocalDateTime> {

    /**
     * {@inheritDoc }
     */
    @Override
    public LocalDateTime deserialize(JsonParser parser, DeserializationContext ctx, Type rtType) {
        return LocalDateTime
            .ofInstant(Instant.ofEpochSecond(Long.parseLong(parser.getString())), ZoneId
                .systemDefault());
    }
}
