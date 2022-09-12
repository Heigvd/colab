/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security;

import java.io.Serializable;
import java.time.OffsetDateTime;

/**
 * To store number of authentication failure
 *
 * @author maxence
 */
public class AuthenticationFailure implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Date of most recent failed attempt
     */
    private OffsetDateTime timestamp;

    /**
     * Number of failed attempt in a row
     */
    private Long counter;

    /**
     * Create a new instance with timestamp = now and counter = 1
     */
    public AuthenticationFailure() {
        this.timestamp = OffsetDateTime.now();
        this.counter = 1l;
    }

    /**
     * Increment counter and touch timestamp
     */
    public void inc() {
        this.counter++;
        this.timestamp = OffsetDateTime.now();
    }

    /**
     * Get instant of first failed attempt
     *
     * @return the date
     */
    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    /**
     * Get the number of failed attempt in a row
     *
     * @return the count
     */
    public Long getCounter() {
        return counter;
    }
}
