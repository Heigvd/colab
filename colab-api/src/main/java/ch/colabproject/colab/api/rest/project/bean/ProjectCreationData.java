/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.project.bean;

import ch.colabproject.colab.api.model.common.Illustration;
import ch.colabproject.colab.api.model.project.ProjectType;
import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

/**
 * Bean with everything needed to create a project
 *
 * @author sandra
 */
@ExtractJavaDoc
public class ProjectCreationData implements Serializable {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The kind : project or model
     */
    private ProjectType type = ProjectType.PROJECT;

    /**
     * The name of the project
     */
    private String name;

    /**
     * The description of the project
     */
    private String description;

    /**
     * The icon to illustrate the project
     */
    private Illustration illustration;

    /**
     * The model used to create the project (optional)
     */
    private Long modelId;

    /**
     * The email address of the people we want to invite
     */
    private List<String> guestsEmail = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the kind : project or model
     */
    public ProjectType getType() {
        return type;
    }

    /**
     * @param type the kind : project or model
     */
    public void setType(ProjectType type) {
        this.type = type;
    }

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
     * @return the icon to illustrate the project
     */
    public Illustration getIllustration() {
        return illustration;
    }

    /**
     * @param illustration the icon to illustrate the project
     */
    public void setIllustration(Illustration illustration) {
        this.illustration = illustration;
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
            .append(this.type)
            .append(this.name)
            .append(this.description)
            .append(this.illustration)
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
            .append(this.type, other.type)
            .append(this.name, other.name)
            .append(this.description, other.description)
            .append(this.illustration, other.illustration)
            .append(this.modelId, other.modelId)
            .isEquals();
    }

    @Override
    public String toString() {
        return "ProjectCreationData{" + " type=" + type.name() + ", name=" + name + ", description=" + description
            + ", illustration=" + illustration + ", modelId=" + modelId
            + ", guestsEmail=" + guestsEmail + "}";
    }

}
