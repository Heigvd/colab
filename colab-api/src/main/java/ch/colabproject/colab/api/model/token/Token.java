/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token;

import ch.colabproject.colab.api.controller.token.TokenManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.common.Tracking;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.model.user.HashMethod;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.generator.model.exceptions.HttpException;
import ch.colabproject.colab.generator.model.tools.DateSerDe;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import java.time.OffsetDateTime;
import java.util.Arrays;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.json.bind.annotation.JsonbTypeSerializer;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.SequenceGenerator;
import javax.validation.constraints.NotNull;

/**
 * @author maxence
 */
@Entity
// JOINED inheritance will generate one "abstract" account table and one table for each subclass.
// Having one table per subclass allows subclasses to defined their own indexes and constraints
@Inheritance(strategy = InheritanceType.JOINED)
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public abstract class Token implements ColabEntity {

    /**
     * a token does not need a salt but, as some HashMethods require one, let's use an hard-coded
     * one
     */
    public static final String SALT = "CAFEBEEF";

    private static final long serialVersionUID = 1L;

    /** token sequence name */
    public static final String TOKEN_SEQUENCE_NAME = "token_seq";

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Project ID.
     */
    @Id
    @SequenceGenerator(name = TOKEN_SEQUENCE_NAME, allocationSize = 20)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = TOKEN_SEQUENCE_NAME)
    private Long id;

    /**
     * creation + modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * token hashed with the hashMethod
     */
    @NotNull
    @JsonbTransient
    private byte[] hashedToken;

    /**
     * Hash method used to hash the plainText token
     */
    @Column(length = 100)
    @Enumerated(value = EnumType.STRING)
    @NotNull
    @JsonbTransient
    private HashMethod hashMethod;

    /**
     * Indicate whether a token must be consumed by an unauthenticated user
     */
    @NotNull
    private Boolean authenticationRequired;

    /**
     * token expiration date. TODO: schedule deletion of outdated tokens
     */
    @JsonbTypeDeserializer(DateSerDe.class)
    @JsonbTypeSerializer(DateSerDe.class)
    private OffsetDateTime expirationDate;

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
     * Set id
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
     * Get the value of hashedToken
     *
     * @return the value of hashedToken
     */
    public byte[] getHashedToken() {
        return hashedToken;
    }

    /**
     * Set the value of hashedToken
     *
     * @param hashedToken new value of hashedToken
     */
    public void setHashedToken(byte[] hashedToken) {
        this.hashedToken = hashedToken;
    }

    /**
     * Get the value of hashMethod
     *
     * @return the value of hashMethod
     */
    public HashMethod getHashMethod() {
        return hashMethod;
    }

    /**
     * Set the value of hashMethod
     *
     * @param hashMethod new value of hashMethod
     */
    public void setHashMethod(HashMethod hashMethod) {
        this.hashMethod = hashMethod;
    }

    /**
     * Get the value of authenticationRequired
     *
     * @return the value of authenticationRequired
     */
    public Boolean isAuthenticationRequired() {
        return authenticationRequired;
    }

    /**
     * Set the value of authenticationRequired
     *
     * @param authenticationRequired new value of authenticationRequired
     */
    public void setAuthenticationRequired(Boolean authenticationRequired) {
        this.authenticationRequired = authenticationRequired;
    }

    /**
     * Get the value of expirationDate
     *
     * @return the value of expirationDate
     */
    public OffsetDateTime getExpirationDate() {
        return expirationDate;
    }

    /**
     * Set the value of expirationDate. Null never expires.
     *
     * @param expirationDate new value of expirationDate
     */
    public void setExpirationDate(OffsetDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }

    // ---------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------

    /**
     * URL to redirect the user to once the token has been consumed.
     *
     * @return redirect to URL
     */
    public abstract String getRedirectTo();

    /**
     * token effect. As some token may requires the resquestManager, give it to them.
     *
     * @param tokenManager token manager that handles all token-specific logic
     *
     * @return true if the token can be consumed
     *
     * @throws HttpException if consumption fails
     */
    public abstract boolean consume(TokenManager tokenManager);

    /**
     * Generate email body
     *
     * @param link link to embed in the body
     *
     * @return email body html text
     */
    public abstract String getEmailBody(String link);

    /**
     * Get message subject
     *
     * @return the message subject
     */
    public abstract String getSubject();

    /**
     * Check plain token against hashed persisted one
     *
     * @param plainToken the plain token to check
     *
     * @return true if there is a match
     */
    public boolean checkHash(String plainToken) {
        byte[] submited = this.getHashMethod().hash(plainToken, SALT);
        return Arrays.equals(submited, this.getHashedToken());
    }

    /**
     * Check is the token is outdated. A token without exipirationDate is never outdated.
     *
     * @return true if the token is outdated.
     */
    @JsonbTransient
    public boolean isOutdated() {
        if (this.expirationDate != null) {
            return this.expirationDate.isBefore(OffsetDateTime.now());
        }
        return false;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        // nothing to do
    }

    @Override
    public Conditions.Condition getReadCondition() {
        return Conditions.alwaysTrue;
    }

    @Override
    public Conditions.Condition getUpdateCondition() {
        // TODO: decide what to do
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
