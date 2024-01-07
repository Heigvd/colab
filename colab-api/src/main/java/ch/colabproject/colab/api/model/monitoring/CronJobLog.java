/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.monitoring;

import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.generator.model.interfaces.WithId;
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import ch.colabproject.colab.generator.model.tools.DateSerDe;

import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.json.bind.annotation.JsonbTypeSerializer;
import javax.persistence.*;
import java.time.OffsetDateTime;

/**
 * @author mikkelvestergaard
 */
@Entity
@Table
@NamedQuery(name = "CronJobLog.findAll", query = "SELECT c from CronJobLog c")
@NamedQuery(name = "CronJobLog.findByName",
        query = "SELECT c from CronJobLog c where c.jobName = :jobName")
public class CronJobLog implements WithJsonDiscriminator, WithId {

    private static final long serialVersionUID = 1L;

    /** cron job log sequence name */
    public static final String CRONJOBLOG_SEQUENCE_NAME = "cronjoblog_seq";

    /**
     * Unique id
     */
    @Id
    @SequenceGenerator(name = CRONJOBLOG_SEQUENCE_NAME, allocationSize = 20)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = CRONJOBLOG_SEQUENCE_NAME)
    private Long id;

    /**
     * Name of cronJob
     */
    @Enumerated(EnumType.STRING)
    private CronJobLogName jobName;

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
    public CronJobLogName getJobName() {
        return jobName;
    }

    /**
     * Set cronJob name
     *
     * @param jobName name
     */
    public void setJobName(CronJobLogName jobName) {
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

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public int hashCode() {
        return EntityHelper.hashCode(this);
    }

    @Override
    @SuppressWarnings("EqualsWhichDoesntCheckParameterClass")
    public boolean equals(Object obj) {
        return EntityHelper.equals(this, obj);
    }

    @Override
    public String toString() {
        return "CronJobLog{" + "id=" + id + ", jobName=" + getJobName()
                + ", lastRunTime=" + getLastRunTime() + '}';
    }

}
