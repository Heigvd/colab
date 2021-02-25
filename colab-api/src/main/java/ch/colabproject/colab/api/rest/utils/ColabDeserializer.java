/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.utils;

import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import javax.json.JsonObject;
import javax.json.bind.JsonbBuilder;
import javax.json.bind.serializer.DeserializationContext;
import javax.json.bind.serializer.JsonbDeserializer;
import javax.json.stream.JsonParser;
import org.reflections.Reflections;

/**
 * Custom deserializer which can handle polymorphic JSONable object
 *
 * @author Maxence
 */
public class ColabDeserializer implements JsonbDeserializer<Jsonable> {

    /**
     * Store class references
     */
    private static final Map<String, Class<? extends Jsonable>> CLASSES_MAP = new HashMap<>();

    /**
     * Reflections allow to find, for instance, all implementations of an interface
     */
    private static final Reflections REFLECTIONS;

    static {
        // analyse classes in the model package
        REFLECTIONS = new Reflections("ch.colabproject.model");
    }

    /**
     * {@inheritDoc }
     */
    @Override
    public Jsonable deserialize(JsonParser parser, DeserializationContext ctx, Type rtType) {

        // find @class discriminant from object to deserialize
        JsonObject value = parser.getObject();
        String atClass = value.getString("@class", null);

        // is this @class already known?
        Class<? extends Jsonable> theClass = CLASSES_MAP.get(atClass);

        if (theClass == null) {
            // nope -> let's resolve it with the help of reflections
            Optional<Class<? extends Jsonable>> eClass = REFLECTIONS.getSubTypesOf(Jsonable.class)
                .stream().filter(cl -> cl.getSimpleName().equals(atClass)).findFirst();
            if (eClass.isPresent()) {
                theClass = eClass.get();
                CLASSES_MAP.put(atClass, theClass);
            }
        }
        // parse JSON against exact class
        return JsonbBuilder.create().fromJson(value.toString(), theClass);
    }
}
