/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model;

/**
 * Describes what has the authority
 *
 * @author sandra
 */
//WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
public enum AuthorityHolderType {
    /**
     * The model has the authority, each project using it will behave the same way
     */
    MODEL,
    /**
     * The project has the authority, independently
     */
    PROJECT;
    // WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
}
