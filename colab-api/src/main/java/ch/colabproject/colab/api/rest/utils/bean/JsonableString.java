/*
 * The coLAB project
 * Copyright (C) 2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.utils.bean;

import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import java.io.Serializable;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

/**
 * Easy way to pass a string between server and client.
 * <p>
 * If we do not use a class, there is a json problem. It could certainly be fixed where dealing with
 * Java and json format transformation.
 *
 * @author sandra
 */
@ExtractJavaDoc
public class JsonableString implements Serializable, WithJsonDiscriminator {

    private static final long serialVersionUID = 1L;

    /** the string */
    private String string;

    /**
     * @return the string
     */
    public String getString() {
        return string;
    }

    /**
     * @param string the string
     */
    public void setString(String string) {
        this.string = string;
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder()
                .append(this.string)
                .toHashCode();
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final JsonableString other = (JsonableString) obj;
        return new EqualsBuilder()
                .append(this.string, other.string)
                .isEquals();
    }

    @Override
    public String toString() {
        return "JsonableString{" + " string=" + string + "}";
    }

}
