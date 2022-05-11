/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.project.bean;

import java.io.Serializable;
import java.util.List;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

/**
 * Bean with everything needed to create a project
 *
 * @author sandra
 */
public class ProjectCreationData  implements Serializable {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The name of the project
     */
    private String name;

    /**
     * The description of the project
     */
    private String description;

    /**
     * The model used to create the project (optional)
     */
    private Long modelId;

    /**
     * The email address of the people we want to invite
     */
    private List<String> guestsEmail;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the name of the project
     */
    public String getName() {
        return name;
    }

    /**
     * @param name the name of the project
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the description of the project
     */
    public String getDescription() {
        return description;
    }

    /**
     * @param description the description of the project
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * @return the model used to create the project (optional)
     */
    public Long getModelId() {
        return modelId;
    }

    /**
     * @param modelId the model used to create the project (optional)
     */
    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    /**
     * @return the email address of the people we want to invite
     */
    public List<String> getGuestsEmail() {
        return guestsEmail;
    }

    /**
     * @param guestsEmail the email address of the people we want to invite
     */
    public void setGuestsEmail(List<String> guestsEmail) {
        this.guestsEmail = guestsEmail;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public int hashCode() {
        return new HashCodeBuilder()
            .append(this.name)
            .append(this.description)
            .append(this.modelId)
            .toHashCode();
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final ProjectCreationData other = (ProjectCreationData) obj;
        return new EqualsBuilder()
            .append(this.name, other.name)
            .append(this.description, other.description)
            .append(this.modelId, other.modelId)
            .isEquals();
    }

    @Override
    public String toString() {
        return "ProjectCreationData{" + " name=" + name + ", description=" + description
            + ", modelId=" + modelId + ", guestsEmail=" + guestsEmail + "}";
    }

}
