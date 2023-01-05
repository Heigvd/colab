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
     * Guests do not have access to anything unless explicit authorization
     */
    GUEST(InvolvementLevel.OUT_OF_THE_LOOP),
    /**
     * Internals have default read/write access to everything but team/roles management
     */
    INTERNAL(InvolvementLevel.INFORMED_READWRITE),
    /**
     * like Internal but can manage team and roles.
     */
    LEADER(InvolvementLevel.INFORMED_READWRITE),
    /**
     * owners has full read/write access to the whole project, bypassing any access control
     */
    OWNER(InvolvementLevel.INFORMED_READWRITE);

    /**
     * give read-write access ?
     */
    private final InvolvementLevel defaultLevel;

    /**
     * Build a Hierarchical position
     *
     * @param defaultLevel default level of involvements
     */
    /*private */ HierarchicalPosition(InvolvementLevel defaultLevel) {
        this.defaultLevel = defaultLevel;
    }

    /**
     * Get the default involvement level.
     *
     * @return the level
     */
    public InvolvementLevel getDefaultInvolvement() {
        return this.defaultLevel;
    }
}
