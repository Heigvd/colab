/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.document;

import static ch.colabproject.colab.api.model.card.Card.STRUCTURE_SEQUENCE_NAME;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.model.tracking.Tracking;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbTypeDeserializer;
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
import javax.persistence.NamedQuery;
import javax.persistence.OneToOne;
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
//FIXME see if is needed or not. It was implemented for test purpose at first
@NamedQuery(name = "Document.findAll", query = "SELECT d FROM Document d")
public abstract class Document implements ColabEntity, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * Document ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = STRUCTURE_SEQUENCE_NAME)
    protected Long id;

    /**
     * creation &amp; modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * The card content for which this document is the deliverable
     */
    // TODO see where to prevent that a document is used by several card contents
    @OneToOne(mappedBy = "deliverable", fetch = FetchType.LAZY)
    @JsonbTransient
    @Deprecated
    private CardContent deliverableCardContent;

    /**
     * The id of the card content for which this document is the deliverable
     */
    @Transient
    @JsonbTransient
    @Deprecated
    private Long deliverableCardContentId;

    /**
     * The index to define the place of the document
     */
    private int index;

    /**
     * The card content for which this document is a deliverable
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private CardContent owningCardContent;

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
    private Resource owningResource;

    /**
     * The id of the resource this document is part of
     */
    @Transient
    private Long owningResourceId;

    /**
     * The resource representing this document
     */
    // TODO see where to prevent that a document is represented by several resources
    @OneToOne(mappedBy = "document", fetch = FetchType.LAZY)
    @JsonbTransient
    @Deprecated
    private Resource resource;

    /**
     * The id of the resource representing this document
     */
    @Transient
    @JsonbTransient
    @Deprecated
    private Long resourceId;

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
     * @return the card content for which this document is the deliverable
     */
    @Deprecated
    public CardContent getDeliverableCardContent() {
        return deliverableCardContent;
    }

    /**
     * @param deliverableCardContent the card content for which this document is the deliverable to
     *                               set
     */
    public void setDeliverableCardContent(CardContent deliverableCardContent) {
        this.deliverableCardContent = deliverableCardContent;
    }

    /**
     * get the id of the card content for which this document is the deliverable. To be sent to
     * client
     *
     * @return the id of the card content
     */
    @Deprecated
    public Long getDeliverableCardContentId() {
        if (this.deliverableCardContent != null) {
            return deliverableCardContent.getId();
        } else {
            return deliverableCardContentId;
        }
    }

    /**
     * set the id of the card content for which this document is the deliverable. For serialization
     * only
     *
     * @param deliverableCardContentId the id of the card content to set
     */
    public void setDeliverableCardContentId(Long deliverableCardContentId) {
        this.deliverableCardContentId = deliverableCardContentId;
    }

    /**
     * @return True if there is a linked deliverable card content
     */
    @Deprecated
    public boolean hasDeliverableCardContent() {
        return deliverableCardContent != null || deliverableCardContentId != null;
    }

    /**
     * @return the index to define the place of the document
     */
    public int getIndex() {
        return index;
    }

    /**
     * @param index the index to define the place of the document to set
     */
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
     * @return the resource representing this document
     */
    @Deprecated
    public Resource getResource() {
        return resource;
    }

    /**
     * @param resource the resource representing this document
     */
    public void setResource(Resource resource) {
        this.resource = resource;
    }

    /**
     * get the id of resource representing this document. To be sent to client
     *
     * @return the id of the resource representing this document
     */
    @Deprecated
    public Long getResourceId() {
        if (this.resource != null) {
            return resource.getId();
        } else {
            return resourceId;
        }
    }

    /**
     * set the id of the resource representing this document. For serialization only
     *
     * @param resourceId the id of the resource representing this document
     */
    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    /**
     * @return True if there is a linked resource
     */
    @Deprecated
    public boolean hasResource() {
        return resource != null || resourceId != null;
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
