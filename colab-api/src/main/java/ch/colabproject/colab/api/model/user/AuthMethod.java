/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.user;

/**
 * This method request the client to send a password using the mandatoryMethod. If an optionalMethod
 * is provided, the client should also send its password using this very method. It will cause the
 * rotation of the methods. *
 *
 * @author maxence
 */
public class AuthMethod {

    /**
     * Hash method used to authenticate
     */
    private final HashMethod mandatoryMethod;

    /**
     * Salt used to prefix the password before hashing it with mandatory method
     */
    private final String salt;

    /**
     * optional method. Use to migrate to a new method or to change the salt
     */
    private final HashMethod optionalMethod;

    /**
     * Salt used to prefix the password before hashing it with optional method
     */
    private final String newSalt;

    /**
     * Build payload to send to client
     *
     * @param mandatoryMethod non null hash method
     * @param salt            non null hex-encoded salt
     * @param optionalMethod  optional hash method
     * @param newSalt         salt to use with optional hash method
     */
    public AuthMethod(HashMethod mandatoryMethod, String salt, HashMethod optionalMethod, String newSalt) {
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
     *
     * @return the salt to use with mandatory method
     */
    public String getSalt() {
        return salt;
    }

    /**
     *
     * @return an optional method
     */
    public HashMethod getOptionalMethod() {
        return optionalMethod;
    }

    /**
     *
     * @return the salt to use with optional method
     */
    public String getNewSalt() {
        return newSalt;
    }
}
