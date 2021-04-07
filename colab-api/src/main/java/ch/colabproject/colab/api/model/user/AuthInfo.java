/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.user;

import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import javax.validation.constraints.NotNull;

/**
 * Contains information sent by the user to authenticate with a password
 *
 * @author maxence
 */
public class AuthInfo implements WithJsonDiscriminator {

    private static final long serialVersionUID = 1L;

    /**
     * user identifier. email address or username
     */
    @NotNull
    private String identifier;

    /**
     * hash of user password computed with the mandatory method
     */
    @NotNull
    private String mandatoryHash;

    /**
     * Optional hash computed by the optional second method
     */
    private String optionalHash;

    /**
     * @return identifier that should match a LocalAccount email or user username
     */
    public String getIdentifier() {
        return identifier;
    }

    /**
     * Set identifier
     *
     * @param identifier email address or username
     */
    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    /**
     * @return the hash
     */
    public String getMandatoryHash() {
        return mandatoryHash;
    }

    /**
     * set hash of current salt+plain_password, hashed with currentMethod
     *
     * @param mandatoryHash hash
     */
    public void setMandatoryHash(String mandatoryHash) {
        this.mandatoryHash = mandatoryHash;
    }

    /**
     * @return optional hash
     */
    public String getOptionalHash() {
        return optionalHash;
    }

    /**
     * set optional hash (hasehd with nextClientMethod and nextHash)
     *
     * @param optionalHash hash
     */
    public void setOptionalHash(String optionalHash) {
        this.optionalHash = optionalHash;
    }
}
