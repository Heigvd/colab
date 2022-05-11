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
import javax.validation.constraints.Size;
import javax.ws.rs.core.MediaType;

/**
 * Document referencing a file stored internally
 *
 * @author sandra
 */
@Entity
@DiscriminatorValue("DOCUMENT_FILE")
public class DocumentFile extends Document {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Original file name
     */
    @Size(max = 255)
    private String fileName;

    /**
     * Mime type of file
     */
    @Size(max = 255)
    @NotNull
    private String mimeType = MediaType.APPLICATION_OCTET_STREAM;

    /**
     * Size of the file in bytes
     */
    @NotNull
    private Long fileSize = 0L;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the original name of the uploaded file or null if no file has been set
     */
    public String getFileName() {
        return fileName;
    }

    /**
     * @param fileName the original name of the uploaded file or null if no file has been set
     */
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    /**
     * @return the mime type of the file or MediaType.APPLICATION_OCTET_STREAM if no file has been
     *         set
     */
    public String getMimeType() {
        return mimeType;
    }

    /**
     * @param mimeType the mime type of the file or MediaType.APPLICATION_OCTET_STREAM if no file has been
     *         set
     */
    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    /**
     * @return length in byte or 0 if no file has been set
     */
    public Long getFileSize() {
        return fileSize;
    }

    /**
     * @param fileSize length in byte or 0 if no file has been set
     */
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        super.merge(other);

        if (other instanceof DocumentFile) {
            DocumentFile o = (DocumentFile) other;
            this.setFileName(o.getFileName());
            this.setMimeType(o.getMimeType());
            this.setFileSize(o.getFileSize());
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
