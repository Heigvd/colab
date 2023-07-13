/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.user;

import static ch.colabproject.colab.api.model.user.User.USER_SEQUENCE_NAME;
import ch.colabproject.colab.api.model.WithPermission;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.AboutAccountChannelsBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ForAdminChannelsBuilder;
import ch.colabproject.colab.generator.model.interfaces.WithId;
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import java.time.OffsetDateTime;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;

/**
 * store session related information
 *
 * @author maxence
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "account_id"),
    }
)
@NamedQuery(
    name = "HttpSession.getOlderThan",
    query = "SELECT session FROM HttpSession session WHERE session.lastSeen < :time"
)
public class HttpSession
    implements WithId, WithJsonDiscriminator, WithPermission, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Not so secret id
     */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = USER_SEQUENCE_NAME)
    private Long id;

    /**
     * raw secret, never persisted, never serialized to client. This is just a temporary field to
     * store the raw value to put in SET-COOKIE
     */
    @Size(max = 255)
    @JsonbTransient
    @Transient
    private String rawSessionSecret;

    /**
     * Session secret id. This value is hashed and is persisted in db.
     * <p>
     * DO NOT SERIALIZE IN JSON EVER
     */
    @JsonbTransient
    @NotEmpty
    private byte[] sessionSecret;

    /**
     * Last activity date
     */
    private OffsetDateTime lastSeen;

    /**
     * User Agent who create the session
     */
    @Size(max = 255)
    private String userAgent;

    /**
     * A HttpSession belongs to an account
     */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JsonbTransient
    private Account account;

    /**
     * id of the account used for authentication
     */
    @Transient
    private Long accountId;

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
     * Get the raw secret. This will almost always return null
     *
     * @return the raw secret or null
     */
    public String getRawSessionSecret() {
        return rawSessionSecret;
    }

    /**
     * Set raw secret value
     *
     * @param rawSessionSecret the raw secret
     */
    public void setRawSessionSecret(String rawSessionSecret) {
        this.rawSessionSecret = rawSessionSecret;
    }

    /**
     * @return Get the session id
     */
    public byte[] getSessionSecret() {
        return sessionSecret;
    }

    /**
     * Set session id
     *
     * @param sessionSecret id of the session
     */
    public void setSessionSecret(byte[] sessionSecret) {
        this.sessionSecret = sessionSecret;
    }

    /**
     * @return Get last activity date
     */
    public OffsetDateTime getLastSeen() {
        return lastSeen;
    }

    /**
     * Set last activity date
     *
     * @param lastSeen lastSeen
     */
    public void setLastSeen(OffsetDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }

    /**
     * Get the value of userAgent
     *
     * @return the value of userAgent
     */
    public String getUserAgent() {
        return userAgent;
    }

    /**
     * Set the value of userAgent
     *
     * @param userAgent new value of userAgent
     */
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    /**
     * Get the account linked to this session. The only case the account may be null is on logout or
     * when the session is going to be deleted
     *
     * @return authenticated account
     */
    public Account getAccount() {
        return account;
    }

    /**
     * Set the account linked to this HttpSession
     *
     * @param account authenticated account
     */
    public void setAccount(Account account) {
        this.account = account;
    }

    /**
     * @return authenticated account, null if not authenticated
     */
    public Long getAccountId() {
        if (account != null) {
            return account.getId();
        } else {
            return accountId;
        }
    }

    /**
     * Set authenticated account id
     *
     * @param accountId id of the account account
     */
    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public ChannelsBuilder getChannelsBuilder() {
        if (this.account != null) {
            return new AboutAccountChannelsBuilder(this.account);
        } else {
            return new ForAdminChannelsBuilder();
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        if (this.account != null) {
            // same
            return this.account.getReadCondition();
        } else {
            // not linked to any account, nothing to hide
            // This case may only exist when the session is about to be destroyed
            return Conditions.alwaysTrue;
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getUpdateCondition() {
        if (this.account != null) {
            // same
            return this.account.getUpdateCondition();
        } else {
            // not linked to any account, nothing to hide
            // This case may only exist when the session is about to be destroyed
            return Conditions.alwaysTrue;
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getCreateCondition() {
        // anyone can create a session
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
        return "HttpSession{" + "id=" + id + ", account=" + account + ", lastSeen=" + lastSeen
            + '}';
    }

}
