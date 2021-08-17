/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
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
     * Externs do not have access to anything unless explicit authorization
     */
    EXTERN(InvolvementLevel.OUT_OF_THE_LOOP),
    /**
     * Interns have default read/write access to everything but team/roles management
     */
    INTERN(InvolvementLevel.INFORMED_READWRITE),
    /**
     * like Intern but can manage team & roles.
     */
    LEAD(InvolvementLevel.INFORMED_READWRITE),
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
    public InvolvementLevel getDefaultInvolvemenet() {
        return this.defaultLevel;
    }
}
