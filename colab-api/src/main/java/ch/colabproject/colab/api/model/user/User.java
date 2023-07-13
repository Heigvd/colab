/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.user;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.common.DeletionStatus;
import ch.colabproject.colab.api.model.common.Tracking;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.AboutUserChannelsBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.generator.model.tools.DateSerDe;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.json.bind.annotation.JsonbTypeSerializer;
import javax.persistence.CascadeType;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import org.apache.commons.lang3.StringUtils;

/**
 * Represents a registered user. A user may authenticate by several means (accounts).
 *
 * @author maxence
 */
@Entity
@Table(name = "users", indexes = {
    @Index(columnList = "username", unique = true), })
@NamedQuery(name = "User.findAll", query = "SELECT u from User u")
@NamedQuery(name = "User.findByUsername",
    query = "SELECT u from User u where u.username = :username")
@NamedQuery(name = "User.findAllAdmin",
    query = "SELECT u from User u where u.isAdmin = TRUE")
public class User implements ColabEntity, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    /** user sequence name */
    public static final String USER_SEQUENCE_NAME = "user_seq";

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * User unique id
     */
    @Id
    @SequenceGenerator(name = USER_SEQUENCE_NAME, allocationSize = 20)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = USER_SEQUENCE_NAME)
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
     * is the user administrator ?
     */
    private boolean isAdmin;

    /**
     * persisted last-activity date
     */
    @JsonbTransient
    private OffsetDateTime lastSeenAt = null;

    /**
     * Last activity date
     */
    @Transient
    @JsonbTypeDeserializer(DateSerDe.class)
    @JsonbTypeSerializer(DateSerDe.class)
    private OffsetDateTime activityDate = null;

    /**
     * Firstname
     */
    @Size(max = 255)
    private String firstname;

    /**
     * Lastname
     */
    @Size(max = 255)
    private String lastname;

    /**
     * short name to be displayed
     */
    @Size(max = 255)
    private String commonname;

    /**
     * User affiliation
     */
    @Size(max = 255)
    private String affiliation;

    /**
     * System-wide unique name. Alphanumeric only
     */
    @Pattern(regexp = "[a-zA-Z0-9_\\-\\.]+")
    @Size(max = 255)
    @NotNull
    private String username;

    /**
     * List of accounts the user can authenticate with
     */
    @OneToMany(mappedBy = "user", cascade = { CascadeType.PERSIST, CascadeType.REMOVE })
    @JsonbTransient
    private List<Account> accounts = new ArrayList<>();

    // Note : the TeamMember list must be retrieved with a DAO
    // because the user must not be seen as changed when a team member is added or removed

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

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
     * @return last seen at
     */
    public OffsetDateTime getLastSeenAt() {
        return lastSeenAt;
    }

    /**
     * update most recent activity date of the user
     *
     * @param lastSeenAt the lastSeenAt date
     */
    public void setLastSeenAt(OffsetDateTime lastSeenAt) {
        this.lastSeenAt = lastSeenAt;
    }

    /**
     * Get last known activity date.
     *
     * @return transient <code>this.activityDate</code> if it exists or persisted
     *         <code>this.lastSeenAt</code> otherwise
     */
    public OffsetDateTime getActivityDate() {
        if (activityDate != null) {
            return activityDate;
        } else {
            return lastSeenAt;
        }
    }

    /**
     * Set transient activity date
     *
     * @param activityDate new activityDate
     */
    public void setActivityDate(OffsetDateTime activityDate) {
        this.activityDate = activityDate;
    }

    /**
     * @return user first name, may be null or empty
     */
    public String getFirstname() {
        return firstname;
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
     * @return user last name, may be null or empty
     */
    public String getLastname() {
        return lastname;
    }

    /**
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
     * @param commonname user common name
     */
    public void setCommonname(String commonname) {
        this.commonname = commonname;
    }

    /**
     * Get the value of affiliation
     *
     * @return the value of affiliation
     */
    public String getAffiliation() {
        return affiliation;
    }

    /**
     * Set the value of affiliation
     *
     * @param affiliation new value of affiliation
     */
    public void setAffiliation(String affiliation) {
        this.affiliation = affiliation;
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

    // ---------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------

    /**
     * get most preferred name to display.
     *
     * @return name to display
     */
    @JsonbTransient
    public String getDisplayName() {
        if (StringUtils.isNotBlank(this.commonname)) {
            return this.commonname;

        } else {
            StringBuilder sb = new StringBuilder();

            if (StringUtils.isNotBlank(this.firstname)) {
                sb.append(this.firstname);
            }
            if (StringUtils.isNotBlank(this.firstname) && StringUtils.isNotBlank(this.lastname)) {
                sb.append(" ");
            }
            if (StringUtils.isNotBlank(this.lastname)) {
                sb.append(this.lastname);
            }

            String toString = sb.toString();
            if (StringUtils.isNotBlank(toString)) {
                return toString;
            }
        }
        return this.username;
    }

    // ---------------------------------------------------------------------------------------------
    // init
    // ---------------------------------------------------------------------------------------------

    /**
     * Set lastSeenAt to now
     */
    // Note : seems to be unused
    public void touchLastSeenAt() {
        this.setLastSeenAt(OffsetDateTime.now());
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void mergeToUpdate(ColabEntity other) throws ColabMergeException {
        if (other instanceof User) {
            User o = (User) other;
            this.setDeletionStatus(o.getDeletionStatus());
            this.setFirstname(o.getFirstname());
            this.setLastname(o.getLastname());
            this.setCommonname(o.getCommonname());
            this.setAffiliation(o.getAffiliation());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public ChannelsBuilder getChannelsBuilder() {
        return new AboutUserChannelsBuilder(this);
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        return new Conditions.Or(
            // unauthenticated users shall read user data to authenticate
            new Conditions.Not(Conditions.authenticated),
            new Conditions.IsCurrentUserThisUser(this),
            new Conditions.DoCurrentUserWorkOnSameProjectThanUser(this)
        );
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getUpdateCondition() {
        return new Conditions.IsCurrentUserThisUser(this);
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getCreateCondition() {
        // anyone can create a user
        return Conditions.alwaysTrue;
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
        return "User{" + "id=" + id + ", deletion=" + getDeletionStatus()
            + ", isAdmin=" + isAdmin + ", username=" + username + '}';
    }

}
