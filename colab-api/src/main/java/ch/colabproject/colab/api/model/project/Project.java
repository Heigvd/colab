/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.project;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.ConcretizationCategory;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.team.Role;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.ws.channel.ProjectOverviewChannel;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
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
     * The name
     */
    private String name;

    /**
     * The description
     */
    private String description;

    /**
     * The concretization type : is it a concrete project or an abstract model
     */
    @Enumerated(value = EnumType.STRING)
    private ConcretizationCategory concretizationCategory;

    /**
     * The root card of the project containing all other cards
     */
    @OneToOne(cascade = CascadeType.ALL) // , optional=false)
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
    private List<Role> roles;

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
     *
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
     * @return the concretization type : is it a concrete project or an abstract model
     */
    public ConcretizationCategory getConcretizationCategory() {
        return concretizationCategory;
    }

    /**
     * @param category the concretization type : is it a concrete project or an abstract model
     */
    public void setConcretizationCategory(ConcretizationCategory category) {
        this.concretizationCategory = category;
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
     * Get the value of roles
     *
     * @return the value of roles
     */
    public List<Role> getRoles() {
        return roles;
    }

    /**
     * Get a role by its name
     *
     * @param name name of the role
     *
     * @return the role or null
     */
    public Role getRoleByName(String name) {
        if (name != null) {
            for (Role r : this.roles) {
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
    public void setRoles(List<Role> roles) {
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
            // TODO see if concretizationCategory should be there
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
        return "Project{" + "id=" + id + ", name=" + name + ", descr=" + description + ", category="
            + concretizationCategory + ", rootCardId=" + getRootCardId() + '}';
    }
}
