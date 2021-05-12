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
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.ManyToOne;
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
public abstract class Block implements ColabEntity /* , WithWebsocketChannels */ {

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
     * The index to define the place in the document
     */
    private int index;

    /**
     * The document it is part of
     */
    @ManyToOne
    @JsonbTransient
    private BlockDocument document;

    /**
     * The id of the document it is part of
     */
    @Transient
    private Long documentId;

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

//  @Override
//  public Set<WebsocketChannel> getChannels() {
//      // TODO
//      return null;
//  }

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
