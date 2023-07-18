/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.common;

/**
 * When an entity needs a conversion, it can be in one of these statues.
 *
 * @author mikkelvestergaard
 * @author sandra
 */
// WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
public enum ConversionStatus {
    /**
     * This has not been converted
     */
    PAGAN,

    /**
     * It does not need to be converted
     */
    NO_NEED,

    /**
     * It has been converted with success
     */
    DONE,

    /**
     * It could not be converted. A manual processing is needed
     */
    ERROR;

    // WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
}
