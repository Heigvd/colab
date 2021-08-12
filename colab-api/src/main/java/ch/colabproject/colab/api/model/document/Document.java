/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.ConcretizationCategory;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.NamedQuery;
import javax.persistence.OneToOne;
import javax.persistence.Transient;

/**
 * Any document
 * <p>
 * The subclass handles the content
 *
 * @author sandra
 */
//TODO adjust the constraints / indexes / cascade / fetch
@Entity
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    /**
     * Title
     */
    protected String title;

    /**
     * Abstract / teaser of the content of the document
     */
    protected String teaser;

    /**
     * The authority holder : is it belonging to
     * <ul>
     * <li>a concrete project and behave for itself</li>
     * <li>a shared abstract model</li>
     * </ul>
     */
    @Enumerated(EnumType.STRING)
    protected ConcretizationCategory authorityHolder;

    /**
     * The card content for which this document is the deliverable
     */
    // TODO see where to prevent that a document is used by several card contents
    @OneToOne(mappedBy = "deliverable", cascade = {}, fetch = FetchType.LAZY)
    @JsonbTransient
    private CardContent deliverableCardContent;

    /**
     * The id of the card content for which this document is the deliverable
     */
    @Transient
    private Long deliverableCardContentId;

    /**
     * The resource representing this document
     */
    // TODO see where to prevent that a document is represented by several resources
    @OneToOne(mappedBy = "document", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonbTransient
    private Resource resource;

    /**
     * The id of the resource representing this document
     */
    @Transient
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
     * @return the title
     */
    public String getTitle() {
        return title;
    }

    /**
     * @param title the title to set
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * @return the abstract / teaser of the content of the document
     */
    public String getTeaser() {
        return teaser;
    }

    /**
     * @param teaser the abstract / teaser of the content of the document
     */
    public void setTeaser(String teaser) {
        this.teaser = teaser;
    }

    /**
     * @return the authority holder : is it belonging to
     * <ul>
     * <li>a concrete project and behave for itself</li>
     * <li>a shared abstract model</li>
     * </ul>
     */
    public ConcretizationCategory getAuthorityHolder() {
        return authorityHolder;
    }

    /**
     * @param authorityHolder the authority holder : is it belonging to
     * <ul>
     * <li>a concrete project and behave for itself</li>
     * <li>a shared abstract model</li>
     * </ul>
     */
    public void setAuthorityHolder(ConcretizationCategory authorityHolder) {
        this.authorityHolder = authorityHolder;
    }

    /**
     * @return the card content for which this document is the deliverable
     */
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
     * @param deliverableCardContentId the id of the card contentto set
     */
    public void setDeliverableCardContentId(Long deliverableCardContentId) {
        this.deliverableCardContentId = deliverableCardContentId;
    }

    /**
     * @return True if there is a linked deliverable card content
     */
    public boolean hasDeliverableCardContent() {
        return deliverableCardContent != null || deliverableCardContentId != null;
    }

    /**
     * @return the resource representing this document
     */
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
    public boolean hasResource() {
        return resource != null || resourceId != null;
    }

    /**
     * Get the project this block belongs to
     *
     * @return block owner
     */
    public Project getProject() {
        if (this.deliverableCardContent != null) {
            // The document is the deliverable of a card content
            return this.deliverableCardContent.getProject();
//        } else if (this.resource != null) {
            // The document is a resource
//            return this.resource.getProject();
        } else {
            // such an orphan shouldn't exist...
            return null;
        }
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof Document) {
            Document o = (Document) other;
            this.setTitle(o.getTitle());
            this.setTeaser(o.getTeaser());
            this.setAuthorityHolder(o.getAuthorityHolder());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public Conditions.Condition getUpdateCondition() {
        if (this.deliverableCardContent != null) {
            // The document is the deliverable of a card content
            return this.deliverableCardContent.getUpdateCondition();
        } else if (this.resource != null) {
            // The document is a resource
            return this.resource.getUpdateCondition();
        } else {
            // such an orphan shouldn't exist...
            return Conditions.alwaysTrue;
        }
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.deliverableCardContent != null) {
            // The document is the deliverable of a card content
            return this.deliverableCardContent.getChannels();
//        } else if (this.resource != null) {
            // The document is a resource
//            return this.resource.getChannels();
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
        return "id=" + id + ", title=" + title + ", teaser=" + teaser + ", authorityHolder="
            + authorityHolder;
    }

}
