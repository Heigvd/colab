/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.utils;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import javax.json.bind.serializer.JsonbSerializer;
import javax.json.bind.serializer.SerializationContext;
import javax.json.stream.JsonGenerator;

/**
 * Let jsonb serialize localDateTime as timestamp
 *
 * @author maxence
 * @deprecated use @JsonbDateFormat(value = JsonbDateFormat.TIME_IN_MILLIS)
 */
@Deprecated
public class DateSerializer implements JsonbSerializer<LocalDateTime> {

    /**
     * {@inheritDoc }
     */
    @Override
    public void serialize(LocalDateTime date, JsonGenerator generator, SerializationContext ctx) {
        generator.write(date.toEpochSecond(ZoneOffset.UTC));
    }
}
