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

import static ch.colabproject.colab.api.setup.ColabConfiguration.getTermsOfUseDate;

/**
 * To store the last date when the Terms of Use and Data Policy were updated
 *
 * @author mikkelvestergaard
 */
public class TermsOfUseManager {
    /**
     * Epoch time of the most recent Terms of Use and Data Policy update
     */
    private static final Long EPOCH_TIME = getTermsOfUseDate();

    /**
     * Date of the most recent Terms of Use and Data Policy  update
     */
    private static final OffsetDateTime TIMESTAMP =
            OffsetDateTime.ofInstant(Instant.ofEpochMilli(EPOCH_TIME), ZoneId.systemDefault());

    /**
     *  Get Terms of Use and Data Policy timestamp as Epoch Time
     *
     * @return the timestamp
     */
    public Long getEpochTime() { return EPOCH_TIME; }

    /**
     * Get Terms of Use and Data Policy timestamp as OffsetDateTime
     *
     * @return the timestamp
     */
    public OffsetDateTime getTimestamp() {
        return TIMESTAMP;
    }
}
