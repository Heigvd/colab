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
     * The filePath to access the document
     */
    private String filePath;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the filePath to access the document
     */
    public String getFilePath() {
        return filePath;
    }

    /**
     * @param filePath the filePath to access the document to set
     */
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof HostedDocLink) {
            HostedDocLink o = (HostedDocLink) other;
            super.merge(o);
            this.setFilePath(o.getFilePath());
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
        return "HostedDocLink{" + super.toPartialString() + ", filePath=" + filePath + "}";
    }

}
