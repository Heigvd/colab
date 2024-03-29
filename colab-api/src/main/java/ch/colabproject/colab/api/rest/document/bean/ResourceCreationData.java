/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.document.bean;

import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

/**
 * Bean with everything needed to create a resource
 *
 * @author sandra
 */
@ExtractJavaDoc
public class ResourceCreationData implements Serializable {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The title of the resource
     */
    private String title;

    /**
     * The teaser of the resource
     */
    private TextDataBlock teaser;

    /**
     * The category of the resource
     */
    private String category;

    /**
     * The abstract card type id
     */
    private Long abstractCardTypeId;

    /**
     * The card id
     */
    private Long cardId;

    /**
     * The card content id
     */
    private Long cardContentId;

    /**
     * Is it at the disposal of the inheritors
     */
    private boolean published;

    /**
     * The document
     */
    private List<Document> documents = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

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
     * @return the teaser
     */
    public TextDataBlock getTeaser() {
        return teaser;
    }

    /**
     * @param teaser the teaser
     */
    public void setTeaser(TextDataBlock teaser) {
        this.teaser = teaser;
    }

    /**
     * @return the category
     */
    public String getCategory() {
        return category;
    }

    /**
     * @param category the category
     */
    public void setCategory(String category) {
        this.category = category;
    }

    /**
     * @return the abstractCardTypeId
     */
    public Long getAbstractCardTypeId() {
        return abstractCardTypeId;
    }

    /**
     * @param abstractCardTypeId the abstractCardTypeId
     */
    public void setAbstractCardTypeId(Long abstractCardTypeId) {
        this.abstractCardTypeId = abstractCardTypeId;
    }

    /**
     * @return the cardId
     */
    public Long getCardId() {
        return cardId;
    }

    /**
     * @param cardId the cardId
     */
    public void setCardId(Long cardId) {
        this.cardId = cardId;
    }

    /**
     * @return the cardContentId
     */
    public Long getCardContentId() {
        return cardContentId;
    }

    /**
     * @param cardContentId the cardContentId
     */
    public void setCardContentId(Long cardContentId) {
        this.cardContentId = cardContentId;
    }

    /**
     * @return if it is at the disposal of the inheritors
     */
    public boolean isPublished() {
        return published;
    }

    /**
     * @param published if it is at the disposal of the inheritors
     */
    public void setPublished(boolean published) {
        this.published = published;
    }

    /**
     * @return the documents
     */
    public List<Document> getDocuments() {
        return documents;
    }

    /**
     * @param documents the documents
     */
    public void setDocuments(List<Document> documents) {
        this.documents = documents;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public int hashCode() {
        return new HashCodeBuilder()
            .append(this.title)
            .append(this.category)
            .append(this.abstractCardTypeId)
            .append(this.cardId)
            .append(this.cardContentId)
            .append(this.published)
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
        final ResourceCreationData other = (ResourceCreationData) obj;
        return new EqualsBuilder()
            .append(this.title, other.title)
            .append(this.category, other.category)
            .append(this.abstractCardTypeId, other.abstractCardTypeId)
            .append(this.cardId, other.cardId)
            .append(this.cardContentId, other.cardContentId)
            .append(this.published, other.published)
            .isEquals();
    }

    @Override
    public String toString() {
        return "ResourceCreationData{" + "title=" + title + ", category=" + category
            + ", abstractCardTypeId=" + abstractCardTypeId + ", cardId=" + cardId
            + ", cardContentId=" + cardContentId + ", published=" + published + "}";
    }

}
