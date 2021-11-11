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
 * Document referenced by a link to an external system
 *
 * @author sandra
 */
//TODO adjust the constraints / indexes
@Entity
@DiscriminatorValue("EXT_LINK")
public class ExternalLink extends Document {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The link to access the document
     */
    private String url;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the link to access the document
     */
    public String getUrl() {
        return url;
    }

    /**
     * @param url the link to access the document to set
     */
    public void setUrl(String url) {
        this.url = url;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof ExternalLink) {
            ExternalLink o = (ExternalLink) other;
            super.merge(o);
            this.setUrl(o.getUrl());
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
        return "ExternalDocLink{" + super.toPartialString() + ", url=" + url + "}";
    }

}
