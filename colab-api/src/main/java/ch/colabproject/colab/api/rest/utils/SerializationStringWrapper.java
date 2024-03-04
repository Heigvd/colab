/*
 * The coLAB project
 * Copyright (C) 2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.utils;

import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;

import java.io.Serializable;
import java.util.Objects;

/**
 * To use when we want to return a simple string as a result of a REST method.
 * <p>
 * If we try to use just String as return type, we have a problem with the json. It may be easy to
 * fix, but to be as quick as possible, I made this class.
 *
 * @author sandra
 */
@ExtractJavaDoc
public class SerializationStringWrapper implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * the string value
     */
    private String value;

    /**
     * constructor
     *
     * @param value the string value
     *
     * @return a new SerializationStringWrapper
     */
    public static SerializationStringWrapper build(String value) {
        SerializationStringWrapper ssw = new SerializationStringWrapper();
        ssw.setValue(value);
        return ssw;
    }

    /**
     * @return the string value
     */
    public String getValue() {
        return value;
    }

    /**
     * @param value the string value
     */
    public void setValue(String value) {
        this.value = value;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 37 * hash + Objects.hashCode(this.getValue());
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            // same object or both are null
            return true;
        }
        if (obj == null) {
            // only one is null
            return false;
        }

        // at this point, both are not null
        if (this.getClass() != obj.getClass()) {
            // class mismatch
            return false;
        } else {
            // same class
            SerializationStringWrapper otherB = (SerializationStringWrapper) obj;
            if (this.getValue() == null || otherB.getValue() == null) {
                // if at least one object has no id, object are not equals
                // if both id are null, objects may equal, but this case is handled by the strict
                // (a == b) equality check
                return false;
            }
            // same class, values must be equal
            return Objects.equals(this.getValue(), otherB.getValue());
        }
    }
}
