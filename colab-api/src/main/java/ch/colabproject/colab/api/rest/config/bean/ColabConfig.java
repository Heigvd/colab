/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.config.bean;

import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;

import javax.validation.constraints.NotNull;

/**
 * Bean to serialize account-related configuration.
 *
 * @author maxence
 */
@ExtractJavaDoc
public class ColabConfig {

    /**
     * Indicated whether the "create an account" button should be displayed
     */
    @NotNull
    private boolean displayCreateLocalAccountButton;

    /**
     * The URI to access the MongoDB container with WS protocol. Used for lexical
     */
    @NotNull
    private String yjsApiEndpoint;

    /**
     * The per file maximum size expressed in bytes
     */
    @NotNull
    private Long jcrRepositoryFileSizeLimit;

    /**
     * Get the value of yjsApiEndpoint
     *
     * @return the value of yjsApiEndpoint
     */
    public String getYjsApiEndpoint() {
        return yjsApiEndpoint;
    }

    /**
     * Set the value of yjsApiEndpoint
     *
     * @param yjsApiEndpoint new value of yjsApiEndpoint
     */
    public void setYjsApiEndpoint(String yjsApiEndpoint) {
        this.yjsApiEndpoint = yjsApiEndpoint;
    }


    /**
     * Get the value of displayCreateLocalAccountButton
     *
     * @return the value of displayCreateLocalAccountButton
     */
    public boolean isDisplayCreateLocalAccountButton() {
        return displayCreateLocalAccountButton;
    }

    /**
     * Set the value of displayCreateLocalAccountButton
     *
     * @param displayCreateLocalAccountButton new value of displayCreateLocalAccountButton
     */
    public void setDisplayCreateLocalAccountButton(boolean displayCreateLocalAccountButton) {
        this.displayCreateLocalAccountButton = displayCreateLocalAccountButton;
    }

    /**
     * Get the value of getJcrRepositoryFileSizeLimit
     *
     * @return the value of getJcrRepositoryFileSizeLimit
     */
    public Long getJcrRepositoryFileSizeLimit() {
        return jcrRepositoryFileSizeLimit;
    }

    /**
     * Set the value of jcrRepositoryFileSizeLimit
     *
     * @param jcrRepositoryFileSizeLimit the value of jcrRepositoryFileSizeLimit
     */
    public void setJcrRepositoryFileSizeLimit(Long jcrRepositoryFileSizeLimit) {
        this.jcrRepositoryFileSizeLimit = jcrRepositoryFileSizeLimit;
    }

}
