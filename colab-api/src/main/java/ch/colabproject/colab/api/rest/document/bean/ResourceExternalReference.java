/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.document.bean;

import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import javax.validation.constraints.NotNull;

/**
 * Summary of project's use of a resource.
 * @author maxence
 */
@ExtractJavaDoc
public class ResourceExternalReference {

    /** usage list */
    public enum Usage {
        /**
         * not a single card(content) even references the resource
         */
        UNUSED,
        /**
         * at least one card(content) references and does not reject the resource
         */
        USED,
        /**
         * all card(content)s which reference the resource rejected it
         */
        REFUSED,
    }

    /** The project which reference the resource */
    @NotNull
    private Project project;

    /**
     * project usage of the resource
     */
    @NotNull
    private Usage usage;

    /**
     * Get the value of project
     *
     * @return the value of project
     */
    public Project getProject() {
        return project;
    }

    /**
     * Set the value of project
     *
     * @param project new value of project
     */
    public void setProject(Project project) {
        this.project = project;
    }

    /**
     * Get the value of usage
     *
     * @return the value of usage
     */
    public Usage getUsage() {
        return usage;
    }

    /**
     * Set the value of usage
     *
     * @param usage new value of usage
     */
    public void setUsage(Usage usage) {
        this.usage = usage;
    }

}
