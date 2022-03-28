/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.project;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.model.tracking.Tracking;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.security.permissions.project.ProjectConditions;
import ch.colabproject.colab.api.ws.channel.ProjectOverviewChannel;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.CascadeType;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

/**
 * A project as persisted in database
 *
 * @author maxence
 * @author sandra
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "rootcard_id"),
    }
)
@NamedQuery(name = "Project.findAll",
    query = "SELECT p FROM Project p")
@NamedQuery(name = "Project.findByTeamMemberUser",
    query = "SELECT p FROM Project p JOIN p.teamMembers members WHERE members.user.id = :userId")
@NamedQuery(name = "Project.findIdsByTeamMemberUser",
    query = "SELECT p.id FROM Project p JOIN p.teamMembers m WHERE m.user.id = :userId")
public class Project implements ColabEntity, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    /** Project sequence name */
    public static final String PROJECT_SEQUENCE_NAME = "project_seq";

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * Project ID
     */
    @Id
    @SequenceGenerator(name = PROJECT_SEQUENCE_NAME, allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = PROJECT_SEQUENCE_NAME)
    private Long id;

    /**
     * creation &amp; modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * The name
     */
    private String name;

    /**
     * The description
     */
    private String description;

    /**
     * The root card of the project containing all other cards
     */
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY) // , optional=false)
    @JsonbTransient
    private Card rootCard;

    // No need to have a rootCardId
    // We do not want to serialize the root card it of the project when sending to client
    // It could cause access control problems. A user can read some project, but not its cards

    /**
     * Roles
     */
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<TeamRole> roles;

    /**
     * List of team members
     */
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<TeamMember> teamMembers = new ArrayList<>();

    /**
     * List of elements to be defined within the cards
     */
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<AbstractCardType> elementsToBeDefined = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
    /**
     * @return the project ID
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the project ID
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the project name
     */
    public String getName() {
        return name;
    }

    /**
     * Set the project name
     *
     * @param name the project name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the description
     */
    public String getDescription() {
        return description;
    }

    /**
     * @param description the description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * @return the root card of the project that contains every other cards
     */
    public Card getRootCard() {
        return rootCard;
    }

    /**
     * @param rootCard the root card of the project that contains every other cards
     */
    public void setRootCard(Card rootCard) {
        this.rootCard = rootCard;
    }

    /**
     * get team members
     *
     * @return members
     */
    public List<TeamMember> getTeamMembers() {
        return teamMembers;
    }

    /**
     * Set team members
     *
     * @param teamMembers list of members
     */
    public void setTeamMembers(List<TeamMember> teamMembers) {
        this.teamMembers = teamMembers;
    }

    /**
     * Get all members with given position
     *
     * @param position the needle
     *
     * @return list of team member with the given position
     */
    public List<TeamMember> getTeamMembersByPosition(HierarchicalPosition position) {
        return this.teamMembers.stream()
            .filter(member -> member.getPosition() == position)
            .collect(Collectors.toList());
    }

    /**
     * Get the value of roles
     *
     * @return the value of roles
     */
    public List<TeamRole> getRoles() {
        return roles;
    }

    /**
     * Get a role by its name
     *
     * @param name name of the role
     *
     * @return the role or null
     */
    public TeamRole getRoleByName(String name) {
        if (name != null) {
            for (TeamRole r : this.roles) {
                if (name.equals(r.getName())) {
                    return r;
                }
            }
        }
        return null;
    }

    /**
     * Set the value of roles
     *
     * @param roles new value of roles
     */
    public void setRoles(List<TeamRole> roles) {
        this.roles = roles;
    }

    /**
     * @return the elementsToDefine
     */
    public List<AbstractCardType> getElementsToBeDefined() {
        return elementsToBeDefined;
    }

    /**
     * @param elements the elementsToDefine to set
     */
    public void setElementsToBeDefined(List<AbstractCardType> elements) {
        this.elementsToBeDefined = elements;
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
    /**
     * {@inheritDoc }
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof Project) {
            Project o = (Project) other;
            this.setName(o.getName());
            this.setDescription(o.getDescription());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    /**
     * Project if propagated through its own overview channel.
     *
     * @return the channel
     */
    @Override
    public Set<WebsocketChannel> getChannels() {
        return Set.of(ProjectOverviewChannel.build(this));
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getCreateCondition() {
        // anybody can create a project
        return Conditions.alwaysTrue;
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        return new ProjectConditions.IsProjectReadable(this.id);
    }

    @Override
    public Conditions.Condition getUpdateCondition() {
        return new Conditions.IsCurrentUserInternalToProject(this);
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
        return "Project{" + "id=" + id + ", name=" + name + ", descr=" + description + '}';
    }
}