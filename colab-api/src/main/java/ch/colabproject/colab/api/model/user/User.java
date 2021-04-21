/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.user;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.ws.channel.AdminChannel;
import ch.colabproject.colab.api.ws.channel.ProjectOverviewChannel;
import ch.colabproject.colab.api.ws.channel.UserChannel;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

/**
 * Represents a registered user. A user may authenticate by several means (accounts).
 *
 * @author maxence
 */
@Entity
@Table(name = "users", indexes = {
    @Index(columnList = "username", unique = true)
})
@NamedQuery(name = "User.findAll", query = "SELECT u from User u")
@NamedQuery(name = "User.findByUsername",
    query = "SELECT u from User u where u.username = :username")
@NamedQuery(name = "User.findAllAdmin",
    query = "SELECT u from User u where u.isAdmin = TRUE")
public class User implements ColabEntity {

    private static final long serialVersionUID = 1L;

    /**
     * User unique id
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * is the user administrator ?
     */
    private boolean isAdmin;

    /**
     * List of accounts the user can authenticate with
     */
    @OneToMany(mappedBy = "user", cascade = {CascadeType.PERSIST, CascadeType.REMOVE})
    @JsonbTransient
    private List<Account> accounts = new ArrayList<>();

    /**
     * List of teams the user is part of
     */
    @OneToMany(mappedBy = "user", cascade = {CascadeType.PERSIST, CascadeType.REMOVE})
    @JsonbTransient
    private List<TeamMember> teamMembers = new ArrayList<>();

    /**
     * last activity date
     */
    @Temporal(TemporalType.TIMESTAMP)
    @Column(columnDefinition = "timestamp with time zone")
    @JsonbTransient
    private Date lastSeenAt = null;

    /**
     * Firstname
     */
    private String firstname;

    /**
     * lastname
     */
    private String lastname;

    /**
     * short name to be displayed
     */
    private String commonname;

    /**
     * System-wide unique name. Alphanumeric only
     */
    @Pattern(regexp = "[a-zA-Z0-9]+")
    @NotNull
    private String username;

    /**
     * @return Id of the user
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * Set user id
     *
     * @param id id of the user
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return user first name, may be null or empty
     */
    public String getFirstname() {
        return firstname;
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
     * Set user first name
     *
     * @param firstname user first name, may be null or empty
     */
    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    /**
     *
     * @return user last name, may be null or empty
     */
    public String getLastname() {
        return lastname;
    }

    /**
     *
     * @param lastname user last name, may be null or empty
     */
    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    /**
     * Short display name to use
     *
     * @return user common name
     */
    public String getCommonname() {
        return commonname;
    }

    /**
     *
     * @param commonname user common name
     */
    public void setCommonname(String commonname) {
        this.commonname = commonname;
    }

    /**
     * Get user's username. This name is unique system-wide
     *
     * @return username
     */
    public String getUsername() {
        return username;
    }

    /**
     * Change the user username. This is sensitive operation as this username is used to reference
     * the user within blocks and so on. Final user shouldn't be able to update its name itself.
     *
     * @param username new username
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * @return the isAdmin
     */
    public boolean isAdmin() {
        return isAdmin;
    }

    /**
     * @param isAdmin the isAdmin to set
     */
    public void setAdmin(boolean isAdmin) {
        this.isAdmin = isAdmin;
    }

    /**
     * @return user accounts
     */
    public List<Account> getAccounts() {
        return accounts;
    }

    /**
     * Set user accounts
     *
     * @param accounts account list
     */
    public void setAccounts(List<Account> accounts) {
        this.accounts = accounts;
    }

    /**
     * @return last seen at
     */
    public Date getLastSeenAt() {
        return new Date(lastSeenAt.getTime());
    }

    /**
     * update most recent activity date of the user
     *
     * @param lastSeenAt the lastSeenAt date
     */
    public void setLastSeenAt(Date lastSeenAt) {
        this.lastSeenAt = new Date(lastSeenAt.getTime());
    }

    /**
     * Set lastSeenAt to now
     */
    public void touchLastSeenAt() {
        this.setLastSeenAt(new Date());
    }

    /**
     * {@inheritDoc }
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof User) {
            User o = (User) other;
            this.setFirstname(o.getFirstname());
            this.setLastname(o.getLastname());
            this.setCommonname(o.getCommonname());
        } else {
            throw new ColabMergeException(this, other);
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

    /**
     * get most preferred name to display.
     *
     * @return name to display
     */
    @JsonbTransient
    public String getDisplayName() {
        if (this.commonname != null && !this.commonname.isBlank()) {
            return this.commonname;
        } else {
            StringBuilder sb = new StringBuilder();

            if (this.firstname != null) {
                sb.append(this.firstname).append(" ");
            }
            if (this.firstname != null) {
                sb.append(this.firstname);
            }
            String toString = sb.toString();
            if (!toString.isBlank()) {
                return toString;
            }
        }
        return this.username;
    }

    /**
     * Get the websocket channel relative to this user.
     *
     * @return the websocket channel
     */
    @JsonbTransient
    public UserChannel getEffectiveChannel() {
        return UserChannel.build(this);
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        Set<WebsocketChannel> channels = new HashSet<>();
        channels.add(this.getEffectiveChannel());
        // teammate through ProjectOverview channels
        this.getTeamMembers().forEach(member -> {
            channels.add(ProjectOverviewChannel.build(member.getProject()));
        });
        // all admin
        channels.add(new AdminChannel());
        return channels;
    }

    @Override
    public String toString() {
        return "User{" + "id=" + id + ", isAdmin=" + isAdmin + ", username=" + username + '}';
    }
}
