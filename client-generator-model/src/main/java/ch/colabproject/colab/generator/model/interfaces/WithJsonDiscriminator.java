/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.model.interfaces;

import ch.colabproject.colab.generator.model.annotations.JsonClassName;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import java.io.Serializable;
import jakarta.json.bind.annotation.JsonbProperty;
import jakarta.json.bind.annotation.JsonbTypeDeserializer;

/**
 * Represent an object which can be serialize to JSON. Implementing this interface force
 * serialization of class discriminator in "@class" property.
 * <p>
 * Default @class value is the concrete class simple name but it can be overriden with
 * {@link JsonClassName} annotation
 *
 * @author maxence
 */
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public interface WithJsonDiscriminator extends Serializable {

    /**
     * Get the JSON discriminator for the given class.
     *
     * @param klass the class to identify
     *
     * @return name to be used as discriminant
     */
    static String getJsonDiscriminator(Class<?> klass) {
        JsonClassName annotation = klass.getAnnotation(JsonClassName.class);

        if (annotation != null) {
            return annotation.value();
        } else {
            return klass.getSimpleName();
        }
    }

    /**
     * Get a unique name which identify the type of the JSON object
     *
     * @return discriminator
     */
    @JsonbProperty("@class")
    default String getJsonDiscriminator() {
        return WithJsonDiscriminator.getJsonDiscriminator(this.getClass());
    }
}
