/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.monitoring;

import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import ch.colabproject.colab.generator.model.tools.DateSerDe;

import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.json.bind.annotation.JsonbTypeSerializer;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import java.time.OffsetDateTime;

/**
 * @author mikkelvestergaard
 */
@Entity
@Table
@NamedQuery(name = "CronJobLog.findAll", query = "SELECT c from CronJobLog c")
public class CronJobLog implements WithJsonDiscriminator {

    private static final long serialVersionUID = 1L;

    /**
     * Unique id
     */
    @Id
    private Long id;

    /**
     * Name of cronJob
     */
    private String jobName;

    /**
     * persisted cronJob time
     */
    @JsonbTypeDeserializer(DateSerDe.class)
    @JsonbTypeSerializer(DateSerDe.class)
    private OffsetDateTime lastRunTime = null;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the project ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Set id
     *
     * @param id id
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the cronJob name
     */
    public String getJobName() { return jobName; }

    /**
     * Set cronJob name
     *
     * @param jobName name
     */
    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    /**
     * @return cronjob time
     */
    public OffsetDateTime getLastRunTime() {
        return lastRunTime;
    }

    /**
     * @param cronJobTime new cronJobTime
     */
    public void setLastRunTime(OffsetDateTime cronJobTime) {
        this.lastRunTime = cronJobTime;
    }

}
