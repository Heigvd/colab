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
 * @author sandra
 */
@Embeddable
@ExtractJavaDoc
public class Tracking implements WithJsonDiscriminator {

    private static final long serialVersionUID = 1L;

    /**
     * Creation timestamp
     */
    @JsonbTypeDeserializer(DateSerDe.class)
    @JsonbTypeSerializer(DateSerDe.class)
    private OffsetDateTime creationTime;

    /**
     * Created by "username"
     */
    @Size(max = 255)
    private String createdBy;

    /**
     * Modification timestamp
     */
    @JsonbTypeDeserializer(DateSerDe.class)
    @JsonbTypeSerializer(DateSerDe.class)
    private OffsetDateTime modificationTime;

    /**
     * Modified by "username"
     */
    @Size(max = 255)
    private String modifiedBy;

    /**
     * Get the timestamp of the creation
     *
     * @return the timestamp of the creation
     */
    public OffsetDateTime getCreationTime() {
        return creationTime;
    }

    /**
     * Set the timestamp of the creation
     *
     * @param creationTime the timestamp of the creation
     */
    public void setCreationTime(OffsetDateTime creationTime) {
        this.creationTime = creationTime;
    }

    /**
     * Get the name of the user who created the entity
     *
     * @return username
     */
    public String getCreatedBy() {
        return createdBy;
    }

    /**
     * Set the name of the user who created the entity
     *
     * @param createdBy username
     */
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    /**
     * Get the timestamp of the most recent modification
     *
     * @return timestamp of the last change
     */
    public OffsetDateTime getModificationTime() {
        return modificationTime;
    }

    /**
     * Set the timestamp of the most recent modification
     *
     * @param modificationTime timestamp of the last change
     */
    public void setModificationTime(OffsetDateTime modificationTime) {
        this.modificationTime = modificationTime;
    }

    /**
     * Get the name of the last user who changed the entity
     *
     * @return username
     */
    public String getModifiedBy() {
        return modifiedBy;
    }

    /**
     * Set the name of the last user who changed the entity
     *
     * @param modifiedBy username
     */
    public void setModifiedBy(String modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

}
