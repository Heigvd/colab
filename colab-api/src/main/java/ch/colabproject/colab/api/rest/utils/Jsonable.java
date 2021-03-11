/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.utils;

import java.io.Serializable;
import javax.json.bind.annotation.JsonbProperty;

/**
 * Represent an object which can be serialize to JSON.
 *
 * @author maxence
 */
public interface Jsonable extends Serializable {

    /**
     * Get the JSON discriminator for the given class.
     *
     * @param klass the class to identify
     *
     * @return name to be used as discriminant
     */
    static String getJsonClassName(Class<?> klass) {
        JsonClassName annotation = klass.getAnnotation(JsonClassName.class);

        if (annotation != null) {
            return annotation.value();
        } else {
            return klass.getSimpleName();
        }
    }

    /**
     * @return a unique name which identify the type of the JSON object
     */
    @JsonbProperty("@class")
    default String getJsonBType() {
        return Jsonable.getJsonClassName(this.getClass());
    }
}
