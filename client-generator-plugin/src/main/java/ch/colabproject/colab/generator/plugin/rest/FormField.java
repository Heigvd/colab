/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.plugin.rest;

import jakarta.ws.rs.core.MediaType;

/**
 * Represents a form field
 *
 * @author maxence
 */
public class FormField<T> {

    /**
     * Field value
     */
    private T data;

    /**
     * MIME Type
     */
    private MediaType mimeType;

    /**
     * Get the value of data
     *
     * @return the value of data
     */
    public T getData() {
        return data;
    }

    /**
     * Set the value of data
     *
     * @param data new value of data
     */
    public void setData(T data) {
        this.data = data;
    }

    /**
     * Get the value of mimeType
     *
     * @return the value of mimeType
     */
    public MediaType getMimeType() {
        return mimeType;
    }

    /**
     * Set the value of mimeType
     *
     * @param mimeType new value of mimeType
     */
    public void setMimeType(MediaType mimeType) {
        this.mimeType = mimeType;
    }

}
