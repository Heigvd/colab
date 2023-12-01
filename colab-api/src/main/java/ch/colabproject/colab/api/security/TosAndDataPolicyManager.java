/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;

/**
 * To store the Terms of Service and Data Policy dates
 *
 * @author mikkelvestergaard
 */
public class TosAndDataPolicyManager {


    /**
     * Epoch time of the most recent ToS and Data Policy update
     */
    private static final Long EPOCHTIME = 1700780400L;

    /**
     * Date of the most recent ToS and Data Policy update
     */
    private static final OffsetDateTime TIMESTAMP = OffsetDateTime.ofInstant(Instant.ofEpochMilli(EPOCHTIME), ZoneId.systemDefault());

    /**
     *  Get ToS and Data Policy timestamp as Epoch Time
     *
     * @return the timestamp
     */
    public Long getEpochTime() { return EPOCHTIME; }

    /**
     * Get ToS and Data Policy timestamp as OffsetDateTime
     *
     * @return the timestamp
     */
    public OffsetDateTime getTimestamp() {
        return TIMESTAMP;
    }
}
