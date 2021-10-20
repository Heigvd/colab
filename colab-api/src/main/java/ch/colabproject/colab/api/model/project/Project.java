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
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Transient;

/**
 * A project as persisted in database
 *
 * @author maxence
 * @author sandra
 */
@Entity
@NamedQuery(name = "Project.findAll", query = "SELECT p FROM Project p")
@NamedQuery(
    name = "Project.findProjectByUser",
    query = "SELECT p FROM Project p JOIN p.teamMembers members WHERE members.user.id = :userId")
public class Project implements ColabEntity, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * Project ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    /**
     * The ID of the root card (serialization sugar)
     */
    @Transient
    private Long rootCardId;

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
     * get the id of the root card. To be sent to client
     *
     * @return id of the root card or null
     */
    public Long getRootCardId() {
        if (this.getRootCard() != null) {
            return this.getRootCard().getId();
        } else {
            return rootCardId;
        }
    }

    /**
     * set the id of the root card. For serialization only
     *
     * @param rootCardId the rootCardId to set
     */
    public void setRootCardId(Long rootCardId) {
        this.rootCardId = rootCardId;
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

        List<Conditions.Condition> orList = new ArrayList<>();

        orList.add(new Conditions.IsCurrentUserMemberOfProject(this));

        this.elementsToBeDefined.stream().forEach(type -> {
            // anyone who has access to a type may read the project too
            orList.add(type.getReadCondition());
        });

        return new Conditions.Or(orList.toArray(
            new Conditions.Condition[orList.size()]));
    }

    @Override
    public Conditions.Condition getUpdateCondition() {
        return new Conditions.IsCurrentUserInternToProject(this);
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
