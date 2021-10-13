/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model;

import ch.colabproject.colab.api.security.permissions.Conditions.Condition;
import javax.json.bind.annotation.JsonbTransient;

/**
 *
 * @author maxence
 */
public interface WithPermission {

    /**
     * Get the condition required to persist this entity
     *
     * @return the condition
     */
    @JsonbTransient
    default Condition getCreateCondition() {
        return getUpdateCondition();
    }

    /**
     * Get the condition required to read this entity
     *
     * @return the condition
     */
    @JsonbTransient
    Condition getReadCondition();

    /**
     * Get the condition required to update this entity
     *
     * @return the condition
     */
    @JsonbTransient
    Condition getUpdateCondition();

    /**
     * Get the condition required to delete this entity
     *
     * @return the condition
     */
    @JsonbTransient
    default Condition getDeleteCondition() {
        return getUpdateCondition();
    }
}
