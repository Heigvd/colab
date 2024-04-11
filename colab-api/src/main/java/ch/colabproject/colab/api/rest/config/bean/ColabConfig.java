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
 * Bean to serialize coLAB configuration.
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
     * The number of days to wait before the elements in bin are removed from bin and flagged as to
     * be permanently deleted
     */
    @NotNull
    private Integer nbDaysToWaitBeforeBinCleaning;

    /**
     * @return The URI to access the MongoDB container with WS protocol. Used for lexical
     */
    public String getYjsApiEndpoint() {
        return yjsApiEndpoint;
    }

    /**
     * @param yjsApiEndpoint The URI to access the MongoDB container with WS protocol. Used for lexical
     */
    public void setYjsApiEndpoint(String yjsApiEndpoint) {
        this.yjsApiEndpoint = yjsApiEndpoint;
    }


    /**
     * @return Indicated whether the "create an account" button should be displayed
     */
    public boolean isDisplayCreateLocalAccountButton() {
        return displayCreateLocalAccountButton;
    }

    /**
     * @param displayCreateLocalAccountButton Indicated whether the "create an account" button should be displayed
     */
    public void setDisplayCreateLocalAccountButton(boolean displayCreateLocalAccountButton) {
        this.displayCreateLocalAccountButton = displayCreateLocalAccountButton;
    }

    /**
     * @return The per file maximum size expressed in bytes
     */
    public Long getJcrRepositoryFileSizeLimit() {
        return jcrRepositoryFileSizeLimit;
    }

    /**
     * @param jcrRepositoryFileSizeLimit The per file maximum size expressed in bytes
     */
    public void setJcrRepositoryFileSizeLimit(Long jcrRepositoryFileSizeLimit) {
        this.jcrRepositoryFileSizeLimit = jcrRepositoryFileSizeLimit;
    }

    /**
     * @return The number of days to wait before the elements in bin are removed from bin and
     * flagged as to be permanently deleted
     */
    public Integer getNbDaysToWaitBeforeBinCleaning() {
        return nbDaysToWaitBeforeBinCleaning;
    }

    /**
     * @param nbDaysToWaitBeforeBinCleaning The number of days to wait before the elements in bin
     *                                      are removed from bin and flagged as to be permanently
     *                                      deleted
     */
    public void setNbDaysToWaitBeforeBinCleaning(Integer nbDaysToWaitBeforeBinCleaning) {
        this.nbDaysToWaitBeforeBinCleaning = nbDaysToWaitBeforeBinCleaning;
    }

}
