/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.CascadeType;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.OneToOne;
import javax.persistence.Transient;

/**
 * A resource is a document provided to help the users to fulfill their goals.
 *
 * @author sandra
 */
// TODO check if a constraint is needed for uniqueness link between a document and a resource
@Entity
@DiscriminatorValue("RESOURCE")
public class Resource extends AbstractResource {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The document
     */
    @OneToOne(cascade = CascadeType.ALL)
    @JsonbTransient
    private Document document;

    /**
     * The document id (serialization sugar)
     */
    @Transient
    private Long documentId;

    /**
     * Is it at the disposal of the inheritors
     */
    private boolean published;

    /**
     * Ask upper level(s) to integrate the resource
     */
    private boolean requestingForGlory;

    /**
     * Should not be used anymore
     */
    private boolean deprecated;

    // ---------------------------------------------------------------------------------------------
    // initialize
    // ---------------------------------------------------------------------------------------------

    /**
     * @return an initialized new resource
     */
    public static Resource initNewResource() {
        // nothing to initialize from the super class
        // implicitly setPublished(false);
        // implicitly setRequestingForGlory(false);
        // implicitly setDeprecated(false);
        return new Resource();
    }

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

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
     * get the id of the document. To be sent to client.
     *
     * @return the id of the document
     */
    public Long getDocumentId() {
        if (document != null) {
            return document.getId();
        } else {
            return documentId;
        }
    }

    /**
     * set the id of the document. For serialization only.
     *
     * @param documentId the id of the document
     */
    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
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
     * @return if it asks upper level(s) to integrate the resource
     */
    public boolean isRequestingForGlory() {
        return requestingForGlory;
    }

    /**
     * @param requestingForGlory if it asks upper level(s) to integrate the resource
     */
    public void setRequestingForGlory(boolean requestingForGlory) {
        this.requestingForGlory = requestingForGlory;
    }

    /**
     * @return if it should not be used anymore
     */
    public boolean isDeprecated() {
        return deprecated;
    }

    /**
     * @param deprecated if it should not be used anymore
     */
    public void setDeprecated(boolean deprecated) {
        this.deprecated = deprecated;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public Resource resolve() {
        return this;
    }

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof Resource) {
            Resource o = (Resource) other;
            this.setPublished(o.isPublished());
            this.setRequestingForGlory(o.isRequestingForGlory());
            this.setDeprecated(o.isDeprecated());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public int hashCode() {
        return EntityHelper.hashCode(this);
    }

    @Override
    @SuppressWarnings("EqualsWhichDoesntCheckParameterClass")
    public boolean equals(Object obj) {
        return EntityHelper.equals(this, obj);
    }

    @Override
    public String toString() {
        return "Resource{" + toPartialString() + ", documentId=" + documentId + ", published="
            + published + ", requestingForGlory=" + requestingForGlory + ", deprecated="
            + deprecated + "}";
    }

}
