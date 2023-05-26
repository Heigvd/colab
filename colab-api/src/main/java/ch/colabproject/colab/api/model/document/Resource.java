/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.common.ConversionStatus;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import java.util.ArrayList;
import java.util.List;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.CascadeType;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.Index;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * A resource is a document provided to help the users to fulfill their goals.
 *
 * @author sandra
 */
@Entity
@Table(indexes = {
        @Index(columnList = "teaser_id"),
})
@DiscriminatorValue("RESOURCE")
public class Resource extends AbstractResource {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The title
     */
    @Size(max = 255)
    private String title;

    /**
     * Is it at the disposal of the inheritors
     */
    @NotNull
    private boolean published;

    /**
     * Ask upper level(s) to integrate the resource
     */
    @NotNull
    private boolean requestingForGlory;

    /**
     * Indicates the resource should not be used anymore
     */
    @NotNull
    private boolean deprecated;

    /**
     * Conversion status : has the deliverable content been converted
     */
    @Enumerated(EnumType.STRING)
    private ConversionStatus lexicalConversion;

    /**
     * The abstract / teaser
     */
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @NotNull
    @JsonbTransient
    private TextDataBlock teaser;

    /**
     * The id of the abstract / teaser
     */
    @Transient
    private Long teaserId;

    /**
     * The content of the resource
     */
    @OneToMany(mappedBy = "owningResource", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<Document> documents = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return The title
     */
    public String getTitle() {
        return title;
    }

    /**
     * @param title The title
     */
    public void setTitle(String title) {
        this.title = title;
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

    /**
     * @return the conversion status : conversion status of documents for
     *         lexical
     */
    public ConversionStatus getLexicalConversion() {
        return lexicalConversion;
    }

    /**
     * @param lexicalConversion the new conversion status : conversion status of
     *                          documents for lexical
     */
    public void setLexicalConversion(ConversionStatus lexicalConversion) {
        this.lexicalConversion = lexicalConversion;
    }

    /**
     * @return the teaser / abstract
     */
    public TextDataBlock getTeaser() {
        return teaser;
    }

    /**
     * @param teaser the teaser / abstract
     */
    public void setTeaser(TextDataBlock teaser) {
        this.teaser = teaser;
    }

    /**
     * get the id of the teaser. To be sent to client.
     *
     * @return the id of the teaser
     */
    public Long getTeaserId() {
        if (teaser != null) {
            return teaser.getId();
        } else {
            return teaserId;
        }
    }

    /**
     * set the id of the teaser. For serialization only.
     *
     * @param teaserId the id of the teaser
     */
    public void setTeaserId(Long teaserId) {
        this.teaserId = teaserId;
    }

    /**
     * @return the content of the resource
     */
    public List<Document> getDocuments() {
        return documents;
    }

    /**
     * @param documents the content of the resource
     */
    public void setDocuments(List<Document> documents) {
        this.documents = documents;
    }

    // ---------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------

    @Override
    public Resource resolve() {
        return this;
    }

    @Override
    public List<AbstractResource> expand() {
        return List.of(this);
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        super.merge(other);

        if (other instanceof Resource) {
            Resource o = (Resource) other;
            this.setTitle(o.getTitle());
            // published cannot be changed alone manually. It is handled by ResourceManager
            this.setRequestingForGlory(o.isRequestingForGlory());
            // deprecated cannot be changed alone manually. It is handled by ResourceManager
            this.setLexicalConversion(o.getLexicalConversion());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public void duplicate(ColabEntity other) throws ColabMergeException {
        super.duplicate(other);

        if (other instanceof Resource) {
            Resource o = (Resource) other;
            this.setTitle(o.getTitle());
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
        return "Resource{" + toPartialString() + ", title=" + title
                + ", published=" + published + ", requestingForGlory=" + requestingForGlory
                + ", deprecated=" + deprecated + ", lexicalConversion" + lexicalConversion + "}";
    }

}
