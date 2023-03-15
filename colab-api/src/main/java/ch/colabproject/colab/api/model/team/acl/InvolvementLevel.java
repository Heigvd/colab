/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.team.acl;

/**
 * RACI matrix in its RACIO form
 */
//WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
public enum InvolvementLevel {
    /**
     * Responsible do the work (read/write access).
     */
    RESPONSIBLE(true),
    /**
     * The one who validate the work (read/write access)
     */
    ACCOUNTABLE(true),
    /**
     * Consulted with read/write access
     */
    CONSULTED_READWRITE(true),
    /**
     * Consulted with read-only access
     */
    CONSULTED_READONLY(false),
    /**
     * Informed with read/write access. It's the default mode.
     */
    INFORMED_READWRITE(true),
    /**
     * Informed with read-only access
     */
    INFORMED_READONLY(false),
    /**
     * Access denied
     */
    OUT_OF_THE_LOOP(false);

    /**
     * give read-write access ?
     */
    private final boolean rw;

    /**
     * Build a level
     *
     * @param rw    give write access ?
     */
    /* private */ InvolvementLevel(boolean rw) {
        this.rw = rw;
    }

    /**
     * Is this level give read-write access ?
     *
     * @return true if write access is granted, false otherwise
     */
    public boolean canWrite() {
        return rw;
    }
}
