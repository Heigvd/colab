/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.user;

import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import javax.validation.constraints.NotNull;

/**
 * Contains information sent by a user to create a new local account
 *
 * @author maxence
 */
@ExtractJavaDoc
public class SignUpInfo implements WithJsonDiscriminator {

    private static final long serialVersionUID = 1L;

    /**
     * user email
     */
    @NotNull
    private String email;

    /**
     * username
     */
    @NotNull
    private String username;

    /**
     * Hash method used to generate hash
     */
    @NotNull
    private HashMethod hashMethod;

    /**
     * salt used to prefix plain password
     */
    @NotNull
    private String salt;

    /**
     * hashMethod(salt+password) result
     */
    @NotNull
    private String hash;

    /**
     * @return the email
     */
    public String getEmail() {
        return email;
    }

    /**
     * set email
     *
     * @param email email
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * @return username
     */
    public String getUsername() {
        return username;
    }

    /**
     * username
     *
     * @param username username
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * @return hash method
     */
    public HashMethod getHashMethod() {
        return hashMethod;
    }

    /**
     * set hash method
     *
     * @param hashMethod hashMethod
     */
    public void setHashMethod(HashMethod hashMethod) {
        this.hashMethod = hashMethod;
    }

    /**
     *
     * @return the salt the user use to salt its plain password
     */
    public String getSalt() {
        return salt;
    }

    /**
     * set the salt
     *
     * @param salt the salt
     */
    public void setSalt(String salt) {
        this.salt = salt;
    }

    /**
     * @return the hash
     */
    public String getHash() {
        return hash;
    }

    /**
     * @param hash the hash
     */
    public void setHash(String hash) {
        this.hash = hash;
    }
}
