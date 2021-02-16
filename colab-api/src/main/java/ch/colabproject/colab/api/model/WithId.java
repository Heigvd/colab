/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model;

import ch.colabproject.colab.api.rest.utils.Jsonable;

/**
 * Simple interface which depict objects having a Long id
 *
 * @author maxence
 */
public interface WithId extends Jsonable {

    /**
     *
     * @return if of the entity
     */
    Long getId();
}
