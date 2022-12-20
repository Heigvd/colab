/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.project;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.common.Tracking;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.security.permissions.project.ProjectConditions;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.EmptyChannelBuilder;
import jakarta.json.bind.annotation.JsonbTransient;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.NotNull;

/**
 * Parameters to copy a project.
 *
 * @author sandra
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "project_id", unique = true),
    }
)
@NamedQuery(
    name = "CopyParam.findByProject",
    query = "SELECT param FROM CopyParam param "
        + "WHERE param.project.id = :projectId")
public class CopyParam implements ColabEntity, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    /** parameters sequence name */
    public static final String PARAM_SEQUENCE_NAME = "param_seq";

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Copy parameter id
     */
    @Id
    @SequenceGenerator(name = PARAM_SEQUENCE_NAME, allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = PARAM_SEQUENCE_NAME)
    private Long id;

    /**
     * creation + modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * Must the roles also be copied
     */
    private boolean withRoles;

    /**
     * Must the deliverables also be copied
     */
    private boolean withDeliverables;

    /**
     * Must the resources also be copied
     */
    private boolean withResources;

    /**
     * The project
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JsonbTransient
    private Project project;

    /**
     * The project ID (serialization sugar)
     */
    @Transient
    private Long projectId;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the copy parameter ID
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the copy parameter ID
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return tracking data
     */
    @Override
    public Tracking getTrackingData() {
        return trackingData;
    }

    /**
     * @param trackingData new tracking data
     */
    @Override
    public void setTrackingData(Tracking trackingData) {
        this.trackingData = trackingData;
    }

    /**
     * @return If the roles must also be copied
     */
    public boolean isWithRoles() {
        return withRoles;
    }

    /**
     * @param withRoles If the roles must also be copied
     */
    public void setWithRoles(boolean withRoles) {
        this.withRoles = withRoles;
    }

    /**
     * @return If the deliverables must also be copied
     */
    public boolean isWithDeliverables() {
        return withDeliverables;
    }

    /**
     * @param withDeliverables If the deliverables must also be copied
     */
    public void setWithDeliverables(boolean withDeliverables) {
        this.withDeliverables = withDeliverables;
    }

    /**
     * @return If the resources must also be copied
     */
    public boolean isWithResources() {
        return withResources;
    }

    /**
     * @param withResources If the resources must also be copied
     */
    public void setWithResources(boolean withResources) {
        this.withResources = withResources;
    }

    /**
     * @return the project it belongs to
     */
    public Project getProject() {
        return project;
    }

    /**
     * @param project the project it belongs to
     */
    public void setProject(Project project) {
        this.project = project;
    }

    /**
     * get the project id. To be sent to client
     *
     * @return id of the project or null
     */
    public Long getProjectId() {
        if (this.project != null) {
            return this.project.getId();
        } else {
            return projectId;
        }
    }

    /**
     * set the project id. For serialization only
     *
     * @param id the id of the project
     */
    public void setProjectId(Long id) {
        this.projectId = id;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof CopyParam) {
            CopyParam t = (CopyParam) other;
            this.setWithRoles(t.isWithRoles());
            this.setWithDeliverables(t.isWithDeliverables());
            this.setWithResources(t.isWithResources());
            // project cannot be changed as easily
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public ChannelsBuilder getChannelsBuilder() {
        if (this.project != null) {
            return this.project.getChannelsBuilder();
        } else {
            // such an orphan shouldn't exist...
            return new EmptyChannelBuilder();
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        if (this.project != null) {
            return new ProjectConditions.IsCopyParamReadable(this.project.getId());
        } else {
            // such an orphan shouldn't exist...
            return Conditions.defaultForOrphan;
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getUpdateCondition() {
        if (this.project != null) {
            return this.project.getUpdateCondition();
        } else {
            // such an orphan shouldn't exist...
            return Conditions.defaultForOrphan;
        }
    }

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
        return "CopyParam{" + "id=" + id + ", projectId=" + projectId + '}';
    }

}
