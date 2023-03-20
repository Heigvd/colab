/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.team.acl;

/**
 * RACI matrix in a RAS form
 */
//WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
public enum InvolvementLevel {
    /**
     * Responsible do the work (read/write access).
     */
    RESPONSIBLE,
    /**
     * The one who validate the work (read/write access)
     */
    ACCOUNTABLE,
    /**
     * Any support
     */
    SUPPORT;

    // no need to have a canWrite property, everything gives read and write access

}
