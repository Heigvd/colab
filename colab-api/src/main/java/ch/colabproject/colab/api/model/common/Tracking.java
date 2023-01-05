/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.common;

import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import ch.colabproject.colab.generator.model.tools.DateSerDe;
import java.time.OffsetDateTime;
import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.json.bind.annotation.JsonbTypeSerializer;
import javax.persistence.Embeddable;
import javax.validation.constraints.Size;

/**
 * To store the creation and modification dates as well as the user who initiate the action
 *
 * @author maxence
 */
@Embeddable
@ExtractJavaDoc
public class Tracking implements WithJsonDiscriminator {

    private static final long serialVersionUID = 1L;

    /**
     * Creation date
     */
    @JsonbTypeDeserializer(DateSerDe.class)
    @JsonbTypeSerializer(DateSerDe.class)
    private OffsetDateTime creationDate;

    /**
     * Create by "username"
     */
    @Size(max = 255)
    private String createdBy;

    /**
     * Modification date
     */
    @JsonbTypeDeserializer(DateSerDe.class)
    @JsonbTypeSerializer(DateSerDe.class)
    private OffsetDateTime modificationDate;

    /**
     * Modified by
     */
    @Size(max = 255)
    private String modifiedBy;

    /**
     * Get the creation date
     *
     * @return creation date
     */
    public OffsetDateTime getCreationDate() {
        return creationDate;
    }

    /**
     * Set the creation date
     *
     * @param creationDate creation date
     */
    public void setCreationDate(OffsetDateTime creationDate) {
        this.creationDate = creationDate;
    }

    /**
     * get created by
     *
     * @return created by
     */
    public String getCreatedBy() {
        return createdBy;
    }

    /**
     * Set create by
     *
     * @param createdBy created by value
     */
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    /**
     * get modification date
     *
     * @return date of most recent modification
     */
    public OffsetDateTime getModificationDate() {
        return modificationDate;
    }

    /**
     * set the date of most recent modification
     *
     * @param modificationDate the date
     */
    public void setModificationDate(OffsetDateTime modificationDate) {
        this.modificationDate = modificationDate;
    }

    /**
     * Get name of last user who touch the entity
     *
     * @return username
     */
    public String getModifiedBy() {
        return modifiedBy;
    }

    /**
     * Set the name of user who touch the entity
     *
     * @param modifiedBy username
     */
    public void setModifiedBy(String modifiedBy) {
        this.modifiedBy = modifiedBy;
    }
}
