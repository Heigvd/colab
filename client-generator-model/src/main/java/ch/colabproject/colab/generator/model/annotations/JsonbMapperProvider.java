/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.model.annotations;

import javax.json.bind.Jsonb;

/**
 *
 * @author maxence
 */
public interface JsonbMapperProvider {

    /**
     * Get a customized mapper
     *
     * @return an Jsonb object
     */
    Jsonb getJsonbMapper();
}
