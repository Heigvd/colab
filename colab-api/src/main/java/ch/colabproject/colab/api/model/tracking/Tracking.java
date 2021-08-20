/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.tracking;

import java.io.Serializable;
import java.time.OffsetDateTime;
import javax.json.bind.annotation.JsonbDateFormat;
import javax.persistence.Embeddable;

/**
 * To store the creation and modification dates as well as the user who initiate the action
 *
 * @author maxence
 */
@Embeddable
public class Tracking implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Creation date
     */
    @JsonbDateFormat(value = JsonbDateFormat.TIME_IN_MILLIS)
    private OffsetDateTime creationDate;

    /**
     * Create by "username"
     */
    private String createdBy;

    /**
     * Modification date
     */
    @JsonbDateFormat(value = JsonbDateFormat.TIME_IN_MILLIS)
    private OffsetDateTime modificationDate;

    /**
     * Modified by
     */
    private String modifiedBy;

    public OffsetDateTime getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(OffsetDateTime creationDate) {
        this.creationDate = creationDate;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public OffsetDateTime getModificationDate() {
        return modificationDate;
    }

    public void setModificationDate(OffsetDateTime modificationDate) {
        this.modificationDate = modificationDate;
    }

    public String getModifiedBy() {
        return modifiedBy;
    }

    public void setModifiedBy(String modifiedBy) {
        this.modifiedBy = modifiedBy;
    }
}
