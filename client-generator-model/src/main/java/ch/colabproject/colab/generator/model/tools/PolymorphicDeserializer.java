/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.model.tools;

import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import javax.json.JsonObject;
import javax.json.bind.serializer.DeserializationContext;
import javax.json.bind.serializer.JsonbDeserializer;
import javax.json.stream.JsonParser;
import org.reflections.Reflections;

/**
 * Custom deserializer which can handle polymorphic objects. By default, this deserializer handles
 * all {@link WithJsonDiscriminator} implementations defined if the
 * <code>ch.colabproject.colab.generator.model</code> package.
 * <p>
 * The {@link #includePackage(java.lang.String) } method can be used to register implementations
 * from other packages.
 * </p>
 * All WithJsonDiscriminator abstract implementation MUST register this deserializer with the
 * {@link javax.json.bind.annotation.JsonbTypeDeserializer  JsonbTypeDeserializer} annotation.
 * <p>
 * Yasson/JSON-b polymorphic deserializer is a "vieux serpent de mer". Some inputs:
 * <ul>
 * <li>https://github.com/eclipse-ee4j/yasson/issues/279
 * <li>https://github.com/eclipse-ee4j/jsonb-api/issues/147
 * <li>https://stackoverflow.com/questions/62398858/deserialize-json-into-polymorphic-pojo-with-json-b-yasson
 * </ul>
 * <p>
 * This implementation does not work if the deserializer is registered with <code>
 * JsonbConfig config = new JsonbConfig().withDeserializers(new PolymorphicDeserializer());
 * </code>. Such a config leads to infinite recusions. See
 * <a href="https://github.com/maxencelaurent/YassonPolymorphicDeserializer/blob/main/src/main/java/com/github/maxencelaurent/yasson/polymorphic/InternalHackDeserializer.java">here</a>
 * for a "global-config" complient implementation.
 *
 * @author Maxence
 */
public class PolymorphicDeserializer implements JsonbDeserializer<WithJsonDiscriminator> {

    /**
     * Store class references
     */
    private static final Map<String, Class<? extends WithJsonDiscriminator>> CLASSES_MAP
        = new HashMap<>();

    /**
     * Reflections allow to find, for instance, all implementations of an interface
     */
    private static final Reflections REFLECTIONS;

    static {
        // analyse classes in the model package
        REFLECTIONS = new Reflections(
            "ch.colabproject.colab.generator.model"
        );
    }

    /**
     * Include all {@link WithJsonDiscriminator} implementations defined in the given package.
     *
     * @param packageName name of the package
     */
    public static void includePackage(String packageName) {
        REFLECTIONS.merge(new Reflections(packageName));
    }

    /**
     * {@inheritDoc }
     */
    @Override
    public WithJsonDiscriminator deserialize(JsonParser parser, DeserializationContext ctx,
        Type rtType) {
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

        return JsonbProvider.getJsonb().fromJson(value.toString(), theClass);
    }
}
