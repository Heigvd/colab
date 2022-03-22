/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.team;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.team.acl.AccessControl;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.model.tracking.Tracking;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.CascadeType;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

/**
 * A member is a {@link User user} which work on a {@link Project project}
 *
 * @author maxence
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "project_id"),
        @Index(columnList = "user_id")
    }
)
@NamedQuery(
    name = "TeamMember.areUserTeammate",
    // SELECT true FROM TeamMember a, TeamMember b WHERE ...
    query = "SELECT true FROM TeamMember a "
    + "JOIN TeamMember b ON a.project.id = b.project.id "
    + "WHERE a.user.id = :aUserId AND b.user.id = :bUserId")
@NamedQuery(
    name = "TeamMember.findByUserAndProject",
    query = "SELECT m FROM TeamMember m "
    + "WHERE m.project.id = :projectId "
    + "AND m.user IS NOT NULL AND m.user.id = :userId"
)
public class TeamMember implements ColabEntity, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    /** project team sequence name */
    public static final String TEAM_SEQUENCE_NAME = "team_seq";

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * Member ID
     */
    @Id
    @SequenceGenerator(name = TEAM_SEQUENCE_NAME, allocationSize = 20)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = TEAM_SEQUENCE_NAME)
    private Long id;

    /**
     * creation &amp; modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * Optional display name. Such a name will hide user.commonName.
     */
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
     * The project
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private Project project;

    /**
     * The roles
     */
    @ManyToMany
    @JoinTable(indexes = {
        @Index(columnList = "members_id"),
        @Index(columnList = "roles_id"),
    })
    @JsonbTransient
    private List<TeamRole> roles;

    /**
     * List of access control relative to this member
     */
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<AccessControl> accessControlList;

    /**
     * Id of the roles. For deserialization only
     */
    @NotNull
    @Transient
    private List<Long> roleIds = new ArrayList<>();

    /**
     * The project ID (serialization sugar)
     */
    @Transient
    private Long projectId;

    /**
     * Hierarchical position of the member
     */
    @NotNull
    @Enumerated(value = EnumType.STRING)
    private HierarchicalPosition position = HierarchicalPosition.INTERNAL;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
    /**
     * @return the member ID
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the member ID
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Get the value of displayName
     *
     * @return the value of displayName
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * Set the value of displayName
     *
     * @param displayName new value of displayName
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
     * @return the project
     */
    public Project getProject() {
        return project;
    }

    /**
     * @param project the project
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

    /**
     * Get roles
     *
     * @return roles
     */
    public List<TeamRole> getRoles() {
        return roles;
    }

    /**
     * Set the list of roles
     *
     * @param roles list of roles
     */
    public void setRoles(List<TeamRole> roles) {
        this.roles = roles;
    }

    /**
     * Get ids of the roles.
     *
     * @return list of ids
     */
    public List<Long> getRoleIds() {
        if (this.roles != null) {
            return roles.stream()
                .map(role -> role.getId())
                .collect(Collectors.toList());
        }
        return roleIds;
    }

    /**
     * The the list of roleId
     *
     * @param roleIds id of roles
     */
    public void setRoleIds(List<Long> roleIds) {
        this.roleIds = roleIds;
    }

    /**
     * Get the list of access control
     *
     * @return access control list
     */
    public List<AccessControl> getAccessControlList() {
        return accessControlList;
    }

    /**
     * Set the list of access control
     *
     * @param accessControlList new list of access control
     */
    public void setAccessControlList(List<AccessControl> accessControlList) {
        this.accessControlList = accessControlList;
    }

    /**
     * Get the hierarchical position of the member
     *
     * @return member's position
     */
    public HierarchicalPosition getPosition() {
        return position;
    }

    /**
     * Set hierarchical position of member
     *
     * @param position new position
     */
    public void setPosition(HierarchicalPosition position) {
        this.position = position;
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

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof TeamMember) {
            TeamMember t = (TeamMember) other;
            this.setDisplayName(t.getDisplayName());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.project != null) {
            return this.project.getChannels();
        } else {
            return Set.of();
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getCreateCondition() {
        if (this.user != null && this.project != null) {
            // any "internal" may invite somebody
            return new Conditions.IsCurrentUserInternalToProject(project);
        } else {
            // anyone can read a pending invitation
            return Conditions.alwaysTrue;
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        if (this.user != null && this.project != null) {
            return new Conditions.IsCurrentUserMemberOfProject(project);
        } else {
            // anyone can read a pending invitation
            return Conditions.alwaysTrue;
        }
    }

    @Override
    public Conditions.Condition getUpdateCondition() {
        if (this.user != null && this.project != null) {
            if (this.position == HierarchicalPosition.OWNER) {
                return new Conditions.IsCurrentUserOwnerOfProject(project);
            } else {
                return new Conditions.IsCurrentUserLeaderOfProject(project);
            }
        } else {
            // anyone can read a pending invitation
            return Conditions.alwaysTrue;
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
            return "TeamMember{pending}";
        } else {
            return "TeamMember{" + "id=" + id + ", userId=" + userId + ", projectId="
                + projectId + "}";
        }
    }
}
