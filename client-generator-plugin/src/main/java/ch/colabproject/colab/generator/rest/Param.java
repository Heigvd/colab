/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.rest;

import java.lang.reflect.Type;

/**
 * represent a REST method parameter
 *
 * @author maxence
 */
public class Param {

    /**
     * Name of the parameter
     */
    private String name;

    /**
     * Some documentation
     */
    private String javadoc;

    /**
     * Parameter type
     */
    private Type type;

    /**
     * Get the value of type
     *
     * @return the value of type
     */
    public Type getType() {
        return type;
    }

    /**
     * Set the value of type
     *
     * @param type new value of type
     */
    public void setType(Type type) {
        this.type = type;
    }

    /**
     * Get the value of name
     *
     * @return the value of name
     */
    public String getName() {
        return name;
    }

    /**
     * Set the value of name
     *
     * @param name new value of name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Get the value of javadoc
     *
     * @return the value of javadoc
     */
    public String getJavadoc() {
        return javadoc;
    }

    /**
     * Set the value of javadoc
     *
     * @param javadoc new value of javadoc
     */
    public void setJavadoc(String javadoc) {
        this.javadoc = javadoc;
    }

}
