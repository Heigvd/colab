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
import javax.validation.constraints.NotNull;
import javax.ws.rs.core.MediaType;

/**
 * Document referencing a file stored internally
 *
 * @author sandra
 */
//TODO adjust the constraints / indexes
@Entity
@DiscriminatorValue("DOCUMENT_FILE")
public class DocumentFile extends Document {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Size of the file in bytes
     */
    @NotNull
    private Long fileSize = 0L;

    /**
     * Original file name
     */
    private String fileName;

    /**
     * Mime type of file
     */
    @NotNull
    private String mimeType = MediaType.APPLICATION_OCTET_STREAM;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return length in byte or 0 if no file has been set
     */
    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    /**
     * @return The original name of the uploaded file or null if no file has been set
     */
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    /**
     * @return The mime type of the file or MediaType.APPLICATION_OCTET_STREAM if no file has been set
     */
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
        if (other instanceof DocumentFile) {
            DocumentFile o = (DocumentFile) other;
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
        return "DocumentFile{" + super.toPartialString() + ", fileName=" + fileName + "}";
    }

}
