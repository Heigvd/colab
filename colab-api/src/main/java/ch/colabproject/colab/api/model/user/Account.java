/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.user;

import static ch.colabproject.colab.api.model.user.User.USER_SEQUENCE_NAME;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.common.Tracking;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.AboutAccountChannelsBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import java.util.ArrayList;
import java.util.List;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.persistence.CascadeType;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

/**
 * Accounts are used by users to authenticate.
 *
 * @author maxence
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "user_id"), }
)
// JOINED inheritance will generate one "abstract" account table and one table for each subclass.
// Having one table per subclass allows subclasses to defined their own indexes and constraints
@Inheritance(strategy = InheritanceType.JOINED)
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public abstract class Account implements ColabEntity, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Account unique ID IDs are unique within all account class hierarchy
     */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = USER_SEQUENCE_NAME)
    private Long id;

    /**
     * creation + modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * An account belongs to an user
     */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JsonbTransient
    private User user;

    /**
     * serialization sugar
     */
    @Transient
    private Long userId;

    /**
     * List of httpSession this account is using
     */
    @OneToMany(mappedBy = "account", cascade = { CascadeType.PERSIST, CascadeType.REMOVE })
    @JsonbTransient
    private List<HttpSession> httpSessions = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return account id
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * set id
     *
     * @param id id
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

    /**
     * @return the user
     */
    public User getUser() {
        return user;
    }

    /**
     * Set account owner
     *
     * @param user user who owns this account
     */
    public void setUser(User user) {
        this.user = user;
    }

    /**
     * Return the id of the account owner
     *
     * @return id of the user
     */
    public Long getUserId() {
        if (this.getUser() != null) {
            return getUser().getId();
        } else {
            return userId;
        }
    }

    /**
     * set the id of the account owner. For serialization only
     *
     * @param id if of the user
     */
    public void setUserId(Long id) {
        this.userId = id;
    }

    /**
     * Get the list of httpSession this account is using
     *
     * @return httpSession list
     */
    public List<HttpSession> getHttpSessions() {
        return httpSessions;
    }

    /**
     * Set the list of httpSession
     *
     * @param httpSessions new httpSessions
     */
    public void setHttpSessions(List<HttpSession> httpSessions) {
        this.httpSessions = httpSessions;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public ChannelsBuilder getChannelsBuilder() {
        return new AboutAccountChannelsBuilder(this);
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        return new Conditions.Or(
            // unauthenticated users shall read account data to authenticate
            new Conditions.Not(Conditions.authenticated),
            new Conditions.IsCurrentUserThisUser(this.user)
        );
    }

    @Override
    public Conditions.Condition getUpdateCondition() {
        if (this.user != null) {
            return this.user.getUpdateCondition();
        } else {
            return Conditions.alwaysFalse;
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getCreateCondition() {
        // anyone can create an account
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

}
