/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.mailhog.model;

import java.util.List;
import jakarta.json.bind.annotation.JsonbProperty;

/**
 * A Mailhog message
 *
 * @author maxence
 */
public class Message {

    /**
     * Mailhog message ID.
     */
    @JsonbProperty("ID")
    private String id;

    /**
     * List of recipient
     */
    @JsonbProperty("To")
    private List<Address> to;

    /**
     * From address
     */
    @JsonbProperty("From")
    private Address from;

    /**
     * Created ?
     */
    @JsonbProperty("Created")
    private String created;

    /**
     * MIME-Type
     */
    @JsonbProperty("MIME")
    private String mime;

    /**
     * Raw data
     */
    @JsonbProperty("Raw")
    private Raw raw;

    /**
     * Message content
     */
    @JsonbProperty("Content")
    private Content content;

    /**
     * Get the value of raw
     *
     * @return the value of raw
     */
    public Raw getRaw() {
        return raw;
    }

    /**
     * Set the value of raw
     *
     * @param raw new value of raw
     */
    public void setRaw(Raw raw) {
        this.raw = raw;
    }

    /**
     * Get the value of id
     *
     * @return the value of id
     */
    public String getId() {
        return id;
    }

    /**
     * Set the value of id
     *
     * @param id new value of id
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Get the value of to
     *
     * @return the value of to
     */
    public List<Address> getTo() {
        return to;
    }

    /**
     * Set the value of to
     *
     * @param to new value of to
     */
    public void setTo(List<Address> to) {
        this.to = to;
    }

    /**
     * Get the value of from
     *
     * @return the value of from
     */
    public Address getFrom() {
        return from;
    }

    /**
     * Set the value of from
     *
     * @param from new value of from
     */
    public void setFrom(Address from) {
        this.from = from;
    }

    /**
     * Get the value of created
     *
     * @return the value of created
     */
    public String getCreated() {
        return created;
    }

    /**
     * Set the value of created
     *
     * @param created new value of created
     */
    public void setCreated(String created) {
        this.created = created;
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
     * Get the value of content
     *
     * @return the value of content
     */
    public Content getContent() {
        return content;
    }

    /**
     * Set the value of content
     *
     * @param content new value of content
     */
    public void setContent(Content content) {
        this.content = content;
    }

}
