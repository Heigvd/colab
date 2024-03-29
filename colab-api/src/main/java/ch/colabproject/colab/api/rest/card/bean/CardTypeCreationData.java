/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.card.bean;

import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import java.io.Serializable;
import java.util.Set;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

/**
 * Bean with everything needed to create a card type
 *
 * @author sandra
 */
@ExtractJavaDoc
public class CardTypeCreationData implements Serializable {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * The id of the project it belongs to
     */
    private Long projectId;

    /**
     * The title
     */
    private String title;

    /**
     * The purpose
     */
    private TextDataBlock purpose;

    /**
     * The tags
     */
    private Set<String> tags;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
    /**
     * @return the projectId
     */
    public Long getProjectId() {
        return projectId;
    }

    /**
     * @param projectId the projectId
     */
    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    /**
     * @return the title
     */
    public String getTitle() {
        return title;
    }

    /**
     * @param title the title
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * @return the purpose
     */
    public TextDataBlock getPurpose() {
        return purpose;
    }

    /**
     * @param purpose the purpose
     */
    public void setPurpose(TextDataBlock purpose) {
        this.purpose = purpose;
    }

    /**
     * Get tags
     *
     * @return the tags
     */
    public Set<String> getTags() {
        return tags;
    }

    /**
     * Set the tags
     *
     * @param tags the tags
     */
    public void setTags(Set<String> tags) {
        this.tags = tags;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
    @Override
    public int hashCode() {
        return new HashCodeBuilder()
            .append(this.projectId)
            .append(this.title)
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
        final CardTypeCreationData other = (CardTypeCreationData) obj;
        return new EqualsBuilder()
            .append(this.projectId, other.projectId)
            .append(this.title, other.title)
            .isEquals();
    }

    @Override
    public String toString() {
        return "CardTypeCreationData{" + ", projectId=" + projectId + "title=" + title + "}";
    }

}
