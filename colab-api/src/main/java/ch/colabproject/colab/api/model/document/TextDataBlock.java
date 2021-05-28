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
