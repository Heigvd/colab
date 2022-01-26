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
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.Lob;
import javax.validation.constraints.NotBlank;

/**
 * Piece of a block document containing text data
 *
 * @author sandra
 */
// TODO adjust the constraints / indexes
@Entity
@DiscriminatorValue("TEXT_DATA")
public class TextDataBlock extends Block {

    private static final long serialVersionUID = 1L;

    /**
     * The mime type by default
     */
    public static final String DEFAULT_MIME_TYPE = "text/markdown";

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The mime type of the information
     */
    private String mimeType;

    /**
     * The information contained
     */
    @Lob
    private String textData;

    /**
     * Current revision hash
     */
    @NotBlank
    private String revision = "0";

    // ---------------------------------------------------------------------------------------------
    // initialize
    // ---------------------------------------------------------------------------------------------

    /**
     * @return an initialized a default block
     */
    public static TextDataBlock initNewDefaultTextDataBlock() {
        TextDataBlock newBlock = new TextDataBlock();
        newBlock.setMimeType(DEFAULT_MIME_TYPE);
        return newBlock;
    }

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
    /**
     * @return the mime type of the information
     */
    public String getMimeType() {
        return mimeType;
    }

    /**
     * @param mimeType the mime type of the information to set
     */
    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    /**
     * @return the information contained
     */
    public String getTextData() {
        return textData;
    }

    /**
     * @param data the information contained to set
     */
    public void setTextData(String data) {
        this.textData = data;
    }

    /**
     * Get the value of revision
     *
     * @return the value of revision
     */
    public String getRevision() {
        return revision;
    }

    /**
     * Set the value of revision
     *
     * @param revision new value of revision
     */
    public void setRevision(String revision) {
        this.revision = revision;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof TextDataBlock) {
            TextDataBlock o = (TextDataBlock) other;
            super.merge(other);
            this.setMimeType(o.getMimeType());
            this.setTextData(o.getTextData());
            // Note : the revision is handled by the LiveManager
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
        return "TextDataBlock{" + super.toPartialString() + ", mimeType=" + mimeType + "}";
    }

}
