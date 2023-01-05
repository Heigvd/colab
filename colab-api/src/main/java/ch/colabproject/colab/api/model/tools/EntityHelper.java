/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.tools;

import ch.colabproject.colab.generator.model.interfaces.WithId;
import java.util.Objects;

/**
 * Helper to normalize common operations on WithId objects
 *
 * @author maxence
 */
public class EntityHelper {

    /**
     * never-called private constructor
     */
    private EntityHelper() {
        throw new UnsupportedOperationException(
            "This is a utility class and cannot be instantiated");
    }

    /**
     * {@link Object#hashCode} implementation for all WithId implementation
     *
     * @param object object to hash
     *
     * @return a hash code value for the given object.
     */
    public static int hashCode(WithId object) {
        int hash = 7;
        hash = 31 * hash + Objects.hashCode(object.getId());
        return hash;
    }

    /**
     * {@link Object#equals} implementation for all WithId implementation. Objects equal if
     * <ul>
     * <li>it's the same reference (strict == equality)
     * <li>both are null
     * <li>they are instance of the same class and have the same id
     * </ul>
     *
     * @param a first object
     * @param b second object
     *
     * @return {@code true} if both objects represent the same persisted entity
     */
    public static boolean equals(WithId a, Object b) {
        if (a == b) {
            // same object or both are null
            return true;
        }
        if (a == null || b == null) {
            // only one is null
            return false;
        }

        // at this point, both are not null
        if (a.getClass() != b.getClass()) {
            // class mismatch
            return false;
        } else {
            // same class
            WithId otherB = (WithId) b;
            if (a.getId() == null || otherB.getId() == null) {
                // if at least one object has no id, object are not equals
                // if both id are null, objects may equal, but this case is handled by the strict
                // (a == b) equality check
                return false;
            }
            // same class, ids must equals
            return Objects.equals(a.getId(), otherB.getId());
        }
    }
}
