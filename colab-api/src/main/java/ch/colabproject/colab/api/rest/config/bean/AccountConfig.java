/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.config.bean;

import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import jakarta.validation.constraints.NotNull;

/**
 * Bean to serialize account-related configuration.
 *
 * @author maxence
 */
@ExtractJavaDoc
public class AccountConfig {

    /**
     * Indicated whether or not the "create an account" button should be displayed
     */
    @NotNull
    private boolean displayCreateLocalAccountButton;

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

}
