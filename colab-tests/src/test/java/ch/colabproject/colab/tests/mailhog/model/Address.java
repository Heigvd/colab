/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.mailhog.model;

import javax.json.bind.annotation.JsonbProperty;

/**
 * A Mailhog Address
 *
 * @author maxence
 */
public class Address {

    /**
     * right part
     */
    @JsonbProperty("Domain")
    private String domain;

    /**
     * address params
     */
    @JsonbProperty("Params")
    private String params;

    /**
     * left part
     */
    @JsonbProperty("Mailbox")
    private String mailbox;

    /**
     * Get the value of domain
     *
     * @return the value of domain
     */
    public String getDomain() {
        return domain;
    }

    /**
     * Set the value of domain
     *
     * @param domain new value of domain
     */
    public void setDomain(String domain) {
        this.domain = domain;
    }

    /**
     * Get the value of params
     *
     * @return the value of params
     */
    public String getParams() {
        return params;
    }

    /**
     * Set the value of params
     *
     * @param params new value of params
     */
    public void setParams(String params) {
        this.params = params;
    }

    /**
     * Get the value of mailbox
     *
     * @return the value of mailbox
     */
    public String getMailbox() {
        return mailbox;
    }

    /**
     * Set the value of mailbox
     *
     * @param mailbox new value of mailbox
     */
    public void setMailbox(String mailbox) {
        this.mailbox = mailbox;
    }

}
