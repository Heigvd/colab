/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.mailhog.model;

import java.util.List;
import javax.json.bind.annotation.JsonbProperty;

/**
 * Raw part of Mailhog message.
 *
 * @author maxence
 */
public class Raw {

    /**
     * From address
     */
    @JsonbProperty("From")
    private String from;

    /**
     * List of recipient
     */
    @JsonbProperty("To")
    private List<String> to;

    /**
     * raw data
     */
    @JsonbProperty("Data")
    private String data;

    /**
     * SMTP helo
     */
    @JsonbProperty("Helo")
    private String helo;

    /**
     * Get the value of helo
     *
     * @return the value of helo
     */
    public String getHelo() {
        return helo;
    }

    /**
     * Set the value of helo
     *
     * @param helo new value of helo
     */
    public void setHelo(String helo) {
        this.helo = helo;
    }

    /**
     * Get the value of from
     *
     * @return the value of from
     */
    public String getFrom() {
        return from;
    }

    /**
     * Set the value of from
     *
     * @param from new value of from
     */
    public void setFrom(String from) {
        this.from = from;
    }

    /**
     * Get the value of to
     *
     * @return the value of to
     */
    public List<String> getTo() {
        return to;
    }

    /**
     * Set the value of to
     *
     * @param to new value of to
     */
    public void setTo(List<String> to) {
        this.to = to;
    }

    /**
     * Get the value of data
     *
     * @return the value of data
     */
    public String getData() {
        return data;
    }

    /**
     * Set the value of data
     *
     * @param data new value of data
     */
    public void setData(String data) {
        this.data = data;
    }

}
