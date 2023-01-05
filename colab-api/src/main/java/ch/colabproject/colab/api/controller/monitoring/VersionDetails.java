/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.monitoring;

import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import javax.validation.constraints.NotNull;

/**
 * Information about the current running colab version
 *
 * @author maxence
 */
@ExtractJavaDoc
public class VersionDetails {

    /**
     * The current build number (aka the github action run number)
     */
    @NotNull
    private String buildNumber;

    /**
     * Name of the docker images (as published in ghcr.io repository)
     */
    @NotNull
    private String dockerImages;

    /**
     * Get the value of dockerImages
     *
     * @return the value of dockerImages
     */
    public String getDockerImages() {
        return dockerImages;
    }

    /**
     * Set the value of dockerImages
     *
     * @param dockerImages new value of dockerImages
     */
    public void setDockerImages(String dockerImages) {
        this.dockerImages = dockerImages;
    }

    /**
     * Get the value of buildNumber.
     *
     * @return current build number or empty if running version is a snapshot
     */
    public String getBuildNumber() {
        return buildNumber;
    }

    /**
     * Set the value of buildNumber
     *
     * @param buildNumber new value of buildNumber
     */
    public void setBuildNumber(String buildNumber) {
        this.buildNumber = buildNumber;
    }

}
