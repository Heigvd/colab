/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.team.acl;

/**
 * Cairo is a RACI matrix + Out of the loop level
 */
//WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
public enum InvolvementLevel {
    /**
     * Responsible do the work (read/write access).
     */
    RESPONSIBLE(1, true),
    /**
     * The one who validate the work (read/write access)
     */
    ACCOUNTABLE(2, true),
    /**
     * Consulted with read/write access
     */
    CONSULTED_READWRITE(3, true),
    /**
     * Consulted with read-only access
     */
    CONSULTED_READONLY(4, false),
    /**
     * Informed with read/write access. It's the default mode.
     */
    INFORMED_READWRITE(5, true),
    /**
     * Informed with read-only access
     */
    INFORMED_READONLY(6, false),
    /**
     * Access denied
     */
    OUT_OF_THE_LOOP(7, false);

    /**
     * give read-write access ?
     */
    private final boolean rw;

    /**
     * Importance level. Lower values are more important than greater
     */
    private final int order;

    /**
     * Build a level
     *
     * @param order importance level
     * @param rw    give write access ?
     */
    /*private*/ InvolvementLevel(int order, boolean rw) {
        this.order = order;
        this.rw = rw;
    }

    /**
     * get level order.
     *
     * @return order
     */
    public int getOrder() {
        return order;
    }

    /**
     * Is this level give read-write access ?
     *
     * @return true if write access is granted, false otherwise
     */
    public boolean isRw() {
        return rw;
    }
}
