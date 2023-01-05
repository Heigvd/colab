/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.project;

/**
 * What kind of project it is. A "simple" project or a model
 *
 * @author sandra
 */
//WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
public enum ProjectType {
    /**
     * A simple project
     */
    PROJECT,
    /**
     * A model of project, base to create simple projects
     */
    MODEL;

    // WARNING ! DO NOT CHANGE THE ENUM NAMES, THEY ARE USED AS KEYS IN DB !!
}
