/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.user;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Index;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

/**
 * Password based authentication.
 *
 * @author maxence
 */
@Entity
@NamedQuery(name = "LocalAccount.findByEmail",
    query = "SELECT a from LocalAccount a where a.email = :email")
@Table(
    // make sure to have JOINED inheritance, otherwise indexes and constraints will be ignored!
    indexes = {
        @Index(columnList = "email", unique = true)
    })
public class LocalAccount extends Account {

    private static final long serialVersionUID = 1L;

    /**
     * username-like email address
     */
    @NotNull
    private String email;

    /**
     * salt+password hash. Hashed with currentDbHashMethod and dbSalt.
     */
    @JsonbTransient
    @NotNull
    private byte[] hashedPassword;

    /**
     * Has the email address been verified with a VerificationToken ?
     */
    @NotNull
    private Boolean verified;

    /**
     * Salt to used before hashing the password
     */
    @JsonbTransient
    @NotNull
    private byte[] dbSalt;

    /**
     * Hash method to use to hashedPassword the salt+password
     */
    @Column(length = 100)
    @Enumerated(value = EnumType.STRING)
    @JsonbTransient
    @NotNull
    private HashMethod currentDbHashMethod;

    /**
     * New hash method to use to hash the salt+password. If not null, rotate hash method on next
     * successful authentication
     */
    @Column(length = 100)
    @Enumerated(value = EnumType.STRING)
    @JsonbTransient
    private HashMethod nextDbHashMethod;

    /**
     * Salt the client shall use to before hashing its password. Salt is hex-encoded byte array
     */
    @NotNull
    @JsonbTransient
    private String clientSalt;

    /**
     * New salt the client shall use to prefix its password before hashing it.
     * <p>
     * In case this is not null, client shall send two hashes. First one is the plain_password
     * prefixed with clientSalt and hashed with currentClientHashMethod (to authenticate), second is
     * its password prefixed with this new salt and hashed with nextClientHashMethod if set, current
     * otherwise. successful authentication (to rotate salt and/or method)
     */
    @JsonbTransient
    private String newClientSalt;

    /**
     * Hash method the client shall use to hashedPassword the clientSalt+plain_password
     */
    @Column(length = 100)
    @Enumerated(value = EnumType.STRING)
    @NotNull
    @JsonbTransient
    private HashMethod currentClientHashMethod;

    /**
     * New hash method the client shall use to hash its clientSalt+plain_password.
     * <p>
     * In case this is not null, client shall send two hashes. First one is its plain_password
     * prefixed clientSalt and hashed with currentClientHashMethod (to authenticate), second is its
     * password prefixed with the new_salt (if set)or the current salt and hashed with this method
     */
    @Column(length = 100)
    @Enumerated(value = EnumType.STRING)
    @JsonbTransient
    private HashMethod nextClientHashMethod;

    /**
     *
     * @return email associated with this account
     */
    public String getEmail() {
        return email;
    }

    /**
     * update email. If the email is not the same, this account will not be verified any longer
     *
     * @param email new email to use.
     */
    public void setEmail(String email) {
        if (Helper.isEmailAddress(email)) {

            if (!email.equals(this.email)) {
                this.verified = false;
            }
            this.email = email;
        }
    }

    /**
     * get the stored hashedPassword to challenge authentication against
     *
     * @return hashedPassword hashedPassword to challenge authentication against
     */
    public byte[] getHashedPassword() {
        return hashedPassword;
    }

    /**
     * Update hashedPassword
     *
     * @param hashedPassword new hashedPassword
     */
    public void setHashedPassword(byte[] hashedPassword) {
        this.hashedPassword = hashedPassword;
    }

    /**
     * has the email address been verified ?
     *
     * @return true if the account is verified
     */
    public Boolean isVerified() {
        return verified;
    }

    /**
     * Set if the account has been verified or not
     *
     * @param verified yes or no ?
     */
    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    /**
     * @return the salt to used server-side
     */
    public byte[] getDbSalt() {
        return dbSalt;
    }

    /**
     * Update the server-side hashedPassword
     *
     * @param dbSalt new server-side salt
     */
    public void setDbSalt(byte[] dbSalt) {
        this.dbSalt = dbSalt;
    }

    /**
     *
     * @return the current hashedPassword method to used to hashedPassword provided password
     */
    public HashMethod getCurrentDbHashMethod() {
        return currentDbHashMethod;
    }

    /**
     * Set the method to use to hashedPassword provided password
     *
     * @param currentDbHashMethod hashedPassword method
     */
    public void setCurrentDbHashMethod(HashMethod currentDbHashMethod) {
        this.currentDbHashMethod = currentDbHashMethod;
    }

    /**
     * @return the next hashedPassword method to use. If not null, hashedPassword methods will be
     *         rotated on next authentication
     */
    public HashMethod getNextDbHashMethod() {
        return nextDbHashMethod;
    }

    /**
     * change the next hashedPassword method to used
     *
     * @param nextDbHashMethod next hashedPassword method
     */
    public void setNextDbHashMethod(HashMethod nextDbHashMethod) {
        this.nextDbHashMethod = nextDbHashMethod;
    }

    /**
     * @return the salt the user shall use before client-side plain_password hashedPassword
     */
    public String getClientSalt() {
        return clientSalt;
    }

    /**
     * Update the salt the client shall use
     *
     * @param clientSalt client salt
     */
    public void setClientSalt(String clientSalt) {
        this.clientSalt = clientSalt;
    }

    /**
     * @return the salt to use to rotate authentication
     */
    public String getNewClientSalt() {
        return newClientSalt;
    }

    /**
     * set a next client-side salt
     *
     * @param newClientSalt new salt we want the client to use
     */
    public void setNewClientSalt(String newClientSalt) {
        this.newClientSalt = newClientSalt;
    }

    /**
     * @return the hashedPassword method the client shall use to hashedPassword its
     *         salt+plain_password
     */
    public HashMethod getCurrentClientHashMethod() {
        return currentClientHashMethod;
    }

    /**
     * CHange hashedPassword method the client shall use
     *
     * @param currentClientHashMethod hashedPassword method the client shall use
     */
    public void setCurrentClientHashMethod(HashMethod currentClientHashMethod) {
        this.currentClientHashMethod = currentClientHashMethod;
    }

    /**
     * @return the next hashedPassword method the client shall use
     */
    public HashMethod getNextClientHashMethod() {
        return nextClientHashMethod;
    }

    /**
     * Update the next client-side hashedPassword method
     *
     * @param nextClientHashMethod new next client hashedPassword method
     */
    public void setNextClientHashMethod(HashMethod nextClientHashMethod) {
        this.nextClientHashMethod = nextClientHashMethod;
    }

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        // TODO
    }

    @Override
    public String toString() {
        return "LocalAccount{" + "id=" + this.getId() + ", email=" + email
            + ", verified=" + verified + '}';
    }

}
