/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.link.StickyNoteSourceable;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
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
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Transient;

/**
 * One piece of a block document
 *
 * @author sandra
 */
//TODO adjust the constraints / indexes
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public abstract class Block implements ColabEntity, WithWebsocketChannels, StickyNoteSourceable {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * The block ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * creation &amp; modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * The index to define the place in the document
     */
    private int index;

    /**
     * The document it is part of
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private BlockDocument document;

    /**
     * The id of the document it is part of
     */
    @Transient
    private Long documentId;

    /**
     * The list of sticky note links of which the block is the source
     */
    @OneToMany(mappedBy = "srcBlock", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<StickyNoteLink> stickyNoteLinksAsSrc = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
    /**
     * @return the block id
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the block id
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the index to define the place in the document
     */
    public int getIndex() {
        return index;
    }

    /**
     * @param index the index to define the place in the document to set
     */
    public void setIndex(int index) {
        this.index = index;
    }

    /**
     * @return the document it is part of
     */
    public BlockDocument getDocument() {
        return document;
    }

    /**
     * @param document the document it is part of
     */
    public void setDocument(BlockDocument document) {
        this.document = document;
    }

    /**
     * get the document id. To be sent to client
     *
     * @return id of the document or null
     */
    public Long getDocumentId() {
        if (this.document != null) {
            return this.document.getId();
        } else {
            return documentId;
        }
    }

    /**
     * set the document id. For serialization only
     *
     * @param id the id of the document
     */
    public void setDocumentId(Long id) {
        this.documentId = id;
    }

    /**
     * Get the project this block belongs to
     *
     * @return block owner
     */
    public Project getProject() {
        if (this.document != null) {
            return this.document.getProject();
        } else {
            // such an orphan shouldn't exist...
            return null;
        }
    }

    /**
     * @return the list of sticky note links of which the block is the source
     */
    @Override
    public List<StickyNoteLink> getStickyNoteLinksAsSrc() {
        return stickyNoteLinksAsSrc;
    }

    /**
     * @param stickyNoteLinksAsSrc the list of sticky note links of which the block is the source
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
    // ---------------------------------------------------------------------------------------------
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof Block) {
            Block o = (Block) other;
            this.setIndex(o.getIndex());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.document != null) {
            return this.document.getChannels();
        } else {
            // such an orphan shouldn't exist...
            return Set.of();
        }
    }

    @Override
    public Conditions.Condition getReadCondition() {
        if (this.document != null) {
            return this.document.getReadCondition();
        } else {
            // such an orphan shouldn't exist...
            return Conditions.defaultForOrphan;
        }
    }

    @Override
    public Conditions.Condition getUpdateCondition() {
        if (this.document != null) {
            return this.document.getUpdateCondition();
        } else {
            // such an orphan shouldn't exist...
            return Conditions.defaultForOrphan;
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
