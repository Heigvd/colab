/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.project;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.common.DeletionStatus;
import ch.colabproject.colab.api.model.common.Tracking;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.EmptyChannelBuilder;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * An instance maker is a user that can use a project model to initiate a new project
 *
 * @author sandra
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "project_id,user_id", unique = true),
        @Index(columnList = "project_id"),
        @Index(columnList = "user_id"),
    }
)
@NamedQuery(name = "InstanceMaker.findAll", query = "SELECT im from InstanceMaker im")
@NamedQuery(
    name = "InstanceMaker.findByProjectAndUser",
    query = "SELECT i from InstanceMaker i "
        + "WHERE i.project.id = :projectId "
        + "AND i.user IS NOT NULL AND i.user.id = :userId")
//@NamedQuery(
//    name = "InstanceMaker.findByUser",
//    query = "SELECT i FROM InstanceMaker i "
//        + "WHERE i.user IS NOT NULL AND i.user.id = :userId")
@NamedQuery(
    name = "InstanceMaker.findByProject",
    query = "SELECT i FROM InstanceMaker i "
        + "WHERE i.project.id = :projectId")
public class InstanceMaker implements ColabEntity, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Instance maker ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = TeamMember.TEAM_SEQUENCE_NAME)
    private Long id;

    /**
     * creation + modification + erasure tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * Is it in a bin or ready to be definitely deleted. Null means active.
     */
    @Enumerated(EnumType.STRING)
    private DeletionStatus deletionStatus;

    /**
     * Optional display name. Such a name will hide user.commonName.
     */
    @Size(max = 255)
    private String displayName;

    /**
     * The user
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private User user;

    /**
     * The user ID (serialization sugar)
     */
    @Transient
    private Long userId;

    /**
     * The model
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JsonbTransient
    private Project project;

    /**
     * The model ID (serialization sugar)
     */
    @Transient
    private Long projectId;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the instance maker ID
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the instance maker ID
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Get the tracking data
     *
     * @return tracking data
     */
    @Override
    public Tracking getTrackingData() {
        return trackingData;
    }

    /**
     * Set tracking data
     *
     * @param trackingData new tracking data
     */
    @Override
    public void setTrackingData(Tracking trackingData) {
        this.trackingData = trackingData;
    }

    @Override
    public DeletionStatus getDeletionStatus() {
        return deletionStatus;
    }

    @Override
    public void setDeletionStatus(DeletionStatus status) {
        this.deletionStatus = status;
    }

    /**
     * Get the display name
     *
     * @return the display name
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * Set the display name
     *
     * @param displayName new display name
     */
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    /**
     * @return the user
     */
    public User getUser() {
        return user;
    }

    /**
     * @param user the user
     */
    public void setUser(User user) {
        this.user = user;
    }

    /**
     * get the user id. To be sent to client
     *
     * @return id of the user or null
     */
    public Long getUserId() {
        if (this.user != null) {
            return this.user.getId();
        } else {
            return userId;
        }
    }

    /**
     * set the user id. For serialization only
     *
     * @param id the id of the user
     */
    public void setUserId(Long id) {
        this.userId = id;
    }

    /**
     * @return the project model
     */
    public Project getProject() {
        return project;
    }

    /**
     * @param project the project model
     */
    public void setProject(Project project) {
        this.project = project;
    }

    /**
     * get the project model id. To be sent to client
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
     * set the project model id. For serialization only
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
    public void mergeToUpdate(ColabEntity other) throws ColabMergeException {
        if (other instanceof InstanceMaker) {
            InstanceMaker o = (InstanceMaker) other;
            this.setDeletionStatus(o.getDeletionStatus());
            this.setDisplayName(o.getDisplayName());
            // project cannot be changed as easily
            // user cannot be changed as easily
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
        if (this.user != null && this.project != null) {
            return new Conditions.Or(new Conditions.IsCurrentUserThisUser(user),
                new Conditions.IsCurrentUserInternalToProject(project));
        }
        // anyone can read a pending model sharing
        return Conditions.alwaysTrue;
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getUpdateCondition() {
        if (this.user != null && this.project != null) {
            return new Conditions.Or(new Conditions.IsCurrentUserThisUser(user),
                new Conditions.IsCurrentUserInternalToProject(project));
        }
        // anyone can read a pending model sharing
        return Conditions.alwaysTrue;
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getCreateCondition() {
        if (this.project != null) {
            // any "internal" may share the model
            return new Conditions.IsCurrentUserInternalToProject(project);
        } else {
            return Conditions.alwaysFalse;
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
        if (user == null) {
            return "InstanceMaker{pending}";
        } else {
            return "InstanceMaker{" + "id=" + id + ", deletion=" + getDeletionStatus()
                + ", userId=" + userId + ", projectId=" + projectId + "}";
        }
    }

}
