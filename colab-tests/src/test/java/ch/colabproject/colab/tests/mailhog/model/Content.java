/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.mailhog.model;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.json.bind.annotation.JsonbProperty;

/**
 *
 * @author maxence
 */
public class Content {

    /**
     * Message headers
     */
    @JsonbProperty("Headers")
    private Map<String, List<String>> headers = new HashMap<>();

    /**
     * Message body
     */
    @JsonbProperty("Body")
    private String body;
    /**
     * Message size
     */
    @JsonbProperty("Size")
    private Integer size;
    /**
     * Message MIME
     */
    @JsonbProperty("MIME")
    private String mime;

    /**
     * Get the value of body
     *
     * @return the value of body
     */
    public String getBody() {
        return body;
    }

    /**
     * Set the value of body
     *
     * @param body new value of body
     */
    public void setBody(String body) {
        this.body = body;
    }

    /**
     * Get the value of size
     *
     * @return the value of size
     */
    public Integer getSize() {
        return size;
    }

    /**
     * Set the value of size
     *
     * @param size new value of size
     */
    public void setSize(Integer size) {
        this.size = size;
    }

    /**
     * Get the value of mime
     *
     * @return the value of mime
     */
    public String getMime() {
        return mime;
    }

    /**
     * Set the value of mime
     *
     * @param mime new value of mime
     */
    public void setMime(String mime) {
        this.mime = mime;
    }

    /**
     * Get the value of headers
     *
     * @return the value of headers
     */
    public Map<String, List<String>> getHeaders() {
        return headers;
    }

    /**
     * Set the value of headers
     *
     * @param headers new value of headers
     */
    public void setHeaders(Map<String, List<String>> headers) {
        this.headers = headers;
    }

}
