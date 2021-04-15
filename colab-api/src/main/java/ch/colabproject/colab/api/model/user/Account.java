/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.user;

import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.ws.channel.AdminChannel;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Transient;

/**
 * Accounts are used by users to authenticate.
 *
 * @author maxence
 */
@Entity
public abstract class Account implements ColabEntity {

    private static final long serialVersionUID = 1L;

    /**
     * Account unique ID IDs are unique within all account class hierarchy
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * An account belongs to an user
     */
    @ManyToOne(optional = false)
    @JsonbTransient
    private User user;

    /**
     * serialization sugar
     */
    @Transient
    private Long userId;

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
     * For serialization only
     *
     * @param id if of the user
     */
    public void setUserId(Long id) {
        this.userId = id;
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.user != null) {
            return Set.of(this.user.getEffectiveChannel(), new AdminChannel());
        } else {
            return Set.of(new AdminChannel());
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
}
