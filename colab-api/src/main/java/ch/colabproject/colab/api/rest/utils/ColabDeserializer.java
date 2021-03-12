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
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;

/**
 * Custom deserializer which can handle polymorphic JSONable object
 *
 * @author Maxence
 */
public class ColabDeserializer implements JsonbDeserializer<WithJsonDiscriminator> {

    /**
     * Store class references
     */
    private static final Map<String, Class<? extends WithJsonDiscriminator>> CLASSES_MAP = new HashMap<>();

    /**
     * Reflections allow to find, for instance, all implementations of an interface
     */
    private static final Reflections REFLECTIONS;

    static {
        // analyse classes in the model package
        REFLECTIONS = new Reflections("ch.colabproject.colab.api.model");
    }

    /**
     * {@inheritDoc }
     */
    @Override
    public WithJsonDiscriminator deserialize(JsonParser parser, DeserializationContext ctx, Type rtType) {

        // find @class discriminant from object to deserialize
        JsonObject value = parser.getObject();
        String atClass = value.getString("@class", null);

        // is this @class already known?
        Class<? extends WithJsonDiscriminator> theClass = CLASSES_MAP.get(atClass);

        if (theClass == null) {
            // nope -> let's resolve it with the help of reflections
            Optional<Class<? extends WithJsonDiscriminator>> concreteClass
                = REFLECTIONS.getSubTypesOf(WithJsonDiscriminator.class)
                    .stream()
                    .filter(cl -> cl.getSimpleName().equals(atClass))
                    .findFirst();
            if (concreteClass.isPresent()) {
                theClass = concreteClass.get();
                CLASSES_MAP.put(atClass, theClass);
            }
        }
        // parse JSON against exact class
        return JsonbBuilder.create().fromJson(value.toString(), theClass);
    }
}
