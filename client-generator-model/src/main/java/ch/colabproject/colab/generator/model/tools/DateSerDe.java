/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.model.tools;

import java.lang.reflect.Type;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import jakarta.json.bind.serializer.DeserializationContext;
import jakarta.json.bind.serializer.JsonbDeserializer;
import jakarta.json.bind.serializer.JsonbSerializer;
import jakarta.json.bind.serializer.SerializationContext;
import jakarta.json.stream.JsonGenerator;
import jakarta.json.stream.JsonParser;

/**
 * Date Serializer and Deserializer.
 * <p>
 * Serialize offsetDateTime as string-encoded UTC timestamp.
 * <p>
 * Deserialize back to OffsetDateTime using system timezone.
 *
 * @author Maxence
 */
public class DateSerDe implements JsonbDeserializer<OffsetDateTime>, JsonbSerializer<OffsetDateTime> {

    @Override
    public OffsetDateTime deserialize(JsonParser jp, DeserializationContext dc, Type type) {
        String aString = jp.getString();
        Long aLong = Long.parseLong(aString);
        return OffsetDateTime.ofInstant(Instant.ofEpochMilli(aLong), ZoneId.systemDefault());
    }

    @Override
    public void serialize(OffsetDateTime t, JsonGenerator jg, SerializationContext sc) {
        sc.serialize(Instant.from(t).toEpochMilli(), jg);
    }

}
