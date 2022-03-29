/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithIndex;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.link.StickyNoteSourceable;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.model.tracking.Tracking;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.persistence.CascadeType;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

/**
 * Any document.
 * <p>
 * The subclass handles the content.
 * <p>
 * A document is owned by either a card content or a resource.
 *
 * @author sandra
 */
//TODO adjust the constraints / indexes / cascade / fetch
@Entity
@Table(
    indexes = {
        @Index(columnList = "owningCardContent_id"),
        @Index(columnList = "owningResource_id"),
    }
)
@Inheritance(strategy = InheritanceType.JOINED)
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public abstract class Document
    implements ColabEntity, WithWebsocketChannels, WithIndex, StickyNoteSourceable {

    /** Name of the document/resource sequence */
    public static final String DOCUMENT_SEQUENCE_NAME = "document_seq";

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * Document ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = DOCUMENT_SEQUENCE_NAME)
    protected Long id;

    /**
     * creation &amp; modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * The index to define the place of the document
     */
    private int index;

    /**
     * The card content for which this document is a deliverable
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    protected CardContent owningCardContent;

    /**
     * The id of the card content for which this document is a deliverable
     */
    @Transient
    private Long owningCardContentId;

    /**
     * The resource this document is part of
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    protected Resource owningResource;

    /**
     * The id of the resource this document is part of
     */
    @Transient
    private Long owningResourceId;

    /**
     * The list of sticky note links of which the document is the source
     */
    @OneToMany(mappedBy = "srcDocument", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<StickyNoteLink> stickyNoteLinksAsSrc = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
    /**
     * @return the document id
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the document id
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the index to define the place of the document
     */
    @Override
    public int getIndex() {
        return index;
    }

    /**
     * @param index the index to define the place of the document to set
     */
    @Override
    public void setIndex(int index) {
        this.index = index;
    }

    /**
     * @return the card content for which this document is a deliverable
     */
    public CardContent getOwningCardContent() {
        return owningCardContent;
    }

    /**
     * @param cardContent the card content for which this document is a deliverable
     */
    public void setOwningCardContent(CardContent cardContent) {
        this.owningCardContent = cardContent;
    }

    /**
     * @return the id of the card content for which this document is a deliverable
     */
    public Long getOwningCardContentId() {
        if (this.owningCardContent != null) {
            return this.owningCardContent.getId();
        } else {
            return owningCardContentId;
        }
    }

    /**
     * @param cardContentId the id of the card content for which this document is a deliverable
     */
    public void setOwningCardContentId(Long cardContentId) {
        this.owningCardContentId = cardContentId;
    }

    /**
     * @return True if there is an owning card content
     */
    public boolean hasOwningCardContent() {
        return this.owningCardContent != null || this.owningCardContentId != null;
    }

    /**
     * @return the resource this document is part of
     */
    public Resource getOwningResource() {
        return owningResource;
    }

    /**
     * @param resource the resource this document is part of
     */
    public void setOwningResource(Resource resource) {
        this.owningResource = resource;
    }

    /**
     * @return the id of the resource this document is part of
     */
    public Long getOwningResourceId() {
        if (this.owningResource != null) {
            return this.owningResource.getId();
        } else {
            return owningResourceId;
        }
    }

    /**
     * @param resourceId the id of the resource this document is part of
     */
    public void setOwningResourceId(Long resourceId) {
        this.owningResourceId = resourceId;
    }

    /**
     * @return True if there is an owning resource
     */
    public boolean hasOwningResource() {
        return this.owningResource != null || this.owningResourceId != null;
    }

    /**
     * @return the list of sticky note links of which the document is the source
     */
    @Override
    public List<StickyNoteLink> getStickyNoteLinksAsSrc() {
        return stickyNoteLinksAsSrc;
    }

    /**
     * @param stickyNoteLinksAsSrc the list of sticky note links of which the document is the source
     */
    public void setStickyNoteLinksAsSrc(List<StickyNoteLink> stickyNoteLinksAsSrc) {
        this.stickyNoteLinksAsSrc = stickyNoteLinksAsSrc;
    }

    /**
     * Get the tracking data
     *
     * @return tracking data
     */
    @Override
    public Tracking getTrackingData() {
        return trackingData;
    }

    /**
     * Set tracking data
     *
     * @param trackingData new tracking data
     */
    @Override
    public void setTrackingData(Tracking trackingData) {
        this.trackingData = trackingData;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof Document) {
            Document o = (Document) other;
            this.setIndex(o.getIndex());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    /**
     * Get the project this document belongs to
     *
     * @return document owner
     */
    @JsonbTransient
    public Project getProject() {
        if (this.owningCardContent != null) {
            // The document is a deliverable of a card content
            return this.owningCardContent.getProject();
        } else if (this.owningResource != null) {
            // The document is part of a resource
            return this.owningResource.getProject();
        } else {
            // such an orphan shouldn't exist...
            return null;
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        if (this.owningCardContent != null) {
            // The document is a deliverable of a card content
            return new Conditions.HasCardReadRight(this.owningCardContent);
        } else if (this.owningResource != null) {
            // The document is part of a resource
            return this.owningResource.getReadCondition();
        } else {
            // such an orphan shouldn't exist...
            return Conditions.defaultForOrphan;
        }
    }

    @Override
    public Conditions.Condition getUpdateCondition() {
        if (this.owningCardContent != null) {
            // The document is a deliverable of a card content
            return this.owningCardContent.getUpdateCondition();
        } else if (this.owningResource != null) {
            // The document is part of a resource
            return this.owningResource.getUpdateCondition();
        } else {
            // such an orphan shouldn't exist...
            return Conditions.defaultForOrphan;
        }
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.owningCardContent != null) {
            // The document is a deliverable of a card content
            return this.owningCardContent.getChannels();
        } else if (this.owningResource != null) {
            // The document is part of a resource
            return this.owningResource.getChannels();
        } else {
            // such an orphan shouldn't exist...
            return Set.of();
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
    public abstract String toString();

    /**
     * @return This abstract class fields to mention in the toString implementations
     */
    protected String toPartialString() {
        return "id=" + id + ", index=" + index;
    }

}
