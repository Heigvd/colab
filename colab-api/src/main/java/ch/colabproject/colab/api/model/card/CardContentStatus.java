/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

/**
 * Status of the card
 *
 * @author sandra
 */
// WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
// TODO challenge if more global than just for card content
public enum CardContentStatus {
    /**
     * This card content is working in progress
     */
    ACTIVE,
    /**
     * This card content needs validation
     */
    TO_VALIDATE,
    /**
     * This card content has been validation
     */
    VALIDATED,
    /**
     * This card content has been rejected
     */
    REJECTED,
    /**
     * This card content has been archived
     */
    ARCHIVED;

    // WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
}
