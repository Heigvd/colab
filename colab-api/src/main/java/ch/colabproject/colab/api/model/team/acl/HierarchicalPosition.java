/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.team.acl;

/**
 * Describe the hierarchical position of a team member
 */
//WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
public enum HierarchicalPosition {
    /**
     * Guests do not have write access unless explicit authorization, but read access to everything
     */
    GUEST(false),
    /**
     * Internals have read/write access to everything by default
     */
    INTERNAL(true),
    /**
     * owners has full read/write access to the whole project, bypassing any access control
     */
    OWNER(true);

    // Note : each always have read access

    /**
     * has read-write access ?
     */
    private final boolean rw;

    /**
     * Build a Hierarchical position
     *
     * @param rw has read-write access ?
     */
    /* private */ HierarchicalPosition(boolean rw) {
        this.rw = rw;
    }

    /**
     * Does this position have read-write access ?
     *
     * @return true if write access is granted, false otherwise
     */
    public boolean canWrite() {
        return rw;
    }
}
