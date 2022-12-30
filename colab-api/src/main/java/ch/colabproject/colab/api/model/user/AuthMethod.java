/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.user;

import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import javax.validation.constraints.NotNull;

/**
 * This method request the client to send a password using the mandatoryMethod. If an optionalMethod
 * is provided, the client should also send its password using this very method. It will cause the
 * rotation of the methods. *
 *
 * @author maxence
 */
@ExtractJavaDoc
public class AuthMethod implements  WithJsonDiscriminator {

    private static final long serialVersionUID = 1L;

    /**
     * Hash method used to authenticate
     */
    @NotNull
    private HashMethod mandatoryMethod;

    /**
     * Salt used to prefix the password before hashing it with mandatory method
     */
    @NotNull
    private String salt;

    /**
     * optional method. Use to migrate to a new method or to change the salt
     */
    private HashMethod optionalMethod;

    /**
     * Salt used to prefix the password before hashing it with optional method
     */
    private String newSalt;

    /**
     * Default constructor
     */
    public AuthMethod() {
        // no-op
    }

    /**
     * Build payload to send to client
     *
     * @param mandatoryMethod non null hash method
     * @param salt            non null hex-encoded salt
     * @param optionalMethod  optional hash method
     * @param newSalt         salt to use with optional hash method
     */
    public AuthMethod(HashMethod mandatoryMethod, String salt,
        HashMethod optionalMethod, String newSalt) {
        this.mandatoryMethod = mandatoryMethod;
        this.salt = salt;
        this.optionalMethod = optionalMethod;
        this.newSalt = newSalt;
    }

    /**
     * @return the method to use to hash the salt+plain_password
     */
    public HashMethod getMandatoryMethod() {
        return mandatoryMethod;
    }

    /**
     * set Mandatory hash method
     *
     * @param mandatoryMethod hash method
     */
    public void setMandatoryMethod(HashMethod mandatoryMethod) {
        this.mandatoryMethod = mandatoryMethod;
    }

    /**
     *
     * @return the salt to use with mandatory method
     */
    public String getSalt() {
        return salt;
    }

    /**
     * Set the salt to use
     *
     * @param salt the salt
     */
    public void setSalt(String salt) {
        this.salt = salt;
    }

    /**
     *
     * @return an optional method
     */
    public HashMethod getOptionalMethod() {
        return optionalMethod;
    }

    /**
     * Set optional method. New salt must be set too
     *
     * @param optionalMethod next hash method to use
     */
    public void setOptionalMethod(HashMethod optionalMethod) {
        this.optionalMethod = optionalMethod;
    }

    /**
     *
     * @return the salt to use with optional method
     */
    public String getNewSalt() {
        return newSalt;
    }

    /**
     * set new salt. Should be set only if optionalMethod is set
     *
     * @param newSalt new salt
     */
    public void setNewSalt(String newSalt) {

        this.newSalt = newSalt;
    }

}
