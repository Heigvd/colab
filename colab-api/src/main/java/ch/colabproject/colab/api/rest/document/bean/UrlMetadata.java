/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.document.bean;

import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import javax.json.bind.annotation.JsonbTransient;
import javax.validation.constraints.NotNull;

/**
 *
 * @author maxence
 */
@ExtractJavaDoc
public class UrlMetadata implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Is the url broken
     */
    @NotNull
    private Boolean broken;

    /**
     * Effective MIME type fetched from http header
     */
    private String contentType;

    /**
     * Date of snapshot
     */
    @JsonbTransient
    private OffsetDateTime date;

    /**
     * Metadata
     */
    @NotNull
    private Map<String, String> metadata = new HashMap<>();

    /**
     * Get the MIME type
     *
     * @return the mime-type or null if unknown
     */
    public String getContentType() {
        return contentType;
    }

    /**
     * Set the MIME type.
     *
     * @param contentType the mime type. Null means unknown
     */
    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    /**
     * Get the metadata
     *
     * @return metadata
     */
    public Map<String, String> getMetadata() {
        return metadata;
    }

    /**
     * Set metadata
     *
     * @param metadata new metadata
     */
    public void setMetadata(Map<String, String> metadata) {
        this.metadata = metadata;
    }

    /**
     * Is the url broken ? It means 404
     *
     * @return if the link is broken
     */
    public Boolean isBroken() {
        return broken;
    }

    /**
     * Set if the link is broken or not
     *
     * @param broken new broken balue
     */
    public void setBroken(Boolean broken) {
        this.broken = broken;
    }

    /**
     * Get the date
     *
     * @return the date
     */
    public OffsetDateTime getDate() {
        return date;
    }

    /** Set the date
     *
     * @param date the date
     */
    public void setDate(OffsetDateTime date) {
        this.date = date;
    }

}
