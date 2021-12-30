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
import javax.ws.rs.core.MediaType;

/**
 * Document referenced by a link to a record of the co.LAB internal document-based database
 *
 * @author sandra
 */
//TODO adjust the constraints / indexes
@Entity
@DiscriminatorValue("HOSTED_DOC_LINK")
public class HostedDocLink extends Document {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Size of the file in bytes
     */
    private Long fileSize = 0L;
    
    /**
     * Original file name
     */
    private String fileName;
    
    /**
     * mime type of file
     */
    private String mimeType = MediaType.APPLICATION_OCTET_STREAM;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }
    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof HostedDocLink) {
            HostedDocLink o = (HostedDocLink) other;
            super.merge(o);
            this.setFileName(o.getFileName());
            this.setFileSize(o.getFileSize());
            this.setMimeType(o.getMimeType());
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
        return "HostedDocLink{" + super.toPartialString() + ", fileName=" + fileName + "}";
    }

}
