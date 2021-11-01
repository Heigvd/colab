/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.document;

import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.Document;
import java.io.Serializable;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

/**
 * Bean with everything needed to create a resource
 *
 * @author sandra
 */
public class ResourceCreationBean implements Serializable {

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
    private Block teaser;

    /**
     * The document
     */
    private Document document;

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
    public Block getTeaser() {
        return teaser;
    }

    /**
     * @param teaser the teaser
     */
    public void setTeaser(Block teaser) {
        this.teaser = teaser;
    }

    /**
     * @return the document
     */
    public Document getDocument() {
        return document;
    }

    /**
     * @param document the document
     */
    public void setDocument(Document document) {
        this.document = document;
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
        final ResourceCreationBean other = (ResourceCreationBean) obj;
        return new EqualsBuilder()
            .append(this.title, other.title)
            .append(this.category, other.category)
            .append(this.abstractCardTypeId, other.abstractCardTypeId)
            .append(this.cardId, other.cardId)
            .append(this.cardContentId, other.cardContentId)
            .isEquals();
    }

    @Override
    public String toString() {
        return "ResourceCreationBean{" + "title=" + title + ", category=" + category
            + ", abstractCardTypeId=" + abstractCardTypeId + ", cardId=" + cardId
            + ", cardContentId=" + cardContentId + "}";
    }

}
