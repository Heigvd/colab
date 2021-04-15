/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model;

/**
 * Concretization category : is it a concrete project or an abstract model that
 * can be used as a basis for a concrete project
 *
 * @author sandra
 */
//WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
public enum ConcretizationCategory {
    /**
     * Concrete project
     */
    PROJECT,
    /**
     * Abstract model that can be used as a basis for a concrete project
     */
    MODEL;
    // WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
}
