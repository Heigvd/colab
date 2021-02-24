/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.user;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

/**
 * Represents a registered user. A user may authenticate by several means (accounts).
 *
 * @author maxence
 */
@Entity
@Table(name = "users")
@NamedQuery(name = "User.findByUsername", query = "SELECT u from User u where u.username = :username")
public class User implements ColabEntity {

    /**
     * User unique id
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * List of accounts the user can authenticate with
     */
    @OneToMany(mappedBy = "user", cascade = {CascadeType.ALL})
    @JsonbTransient
    private List<Account> accounts = new ArrayList<>();

    /**
     * last activity date
     */
    @Temporal(TemporalType.TIMESTAMP)
    @Column(columnDefinition = "timestamp with time zone")
    @JsonbTransient
    private Date lastSeenAt = null;

    /**
     * Firstname
     */
    private String firstname;

    /**
     * lastname
     */
    private String lasttname;

    /**
     * short name to be displayed
     */
    private String commonname;

    /**
     * System-wide unique name
     */
    private String username;

    /**
     * @return Id of the user
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * Set user id
     *
     * @param id id of the user
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return user first name, may be null or empty
     */
    public String getFirstname() {
        return firstname;
    }

    /**
     * Set user first name
     *
     * @param firstname user first name, may be null or empty
     */
    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    /**
     *
     * @return user last name, may be null or empty
     */
    public String getLasttname() {
        return lasttname;
    }

    /**
     *
     * @param lasttname user last name, may be null or empty
     */
    public void setLasttname(String lasttname) {
        this.lasttname = lasttname;
    }

    /**
     * Short display name to use
     *
     * @return user common name
     */
    public String getCommonname() {
        return commonname;
    }

    /**
     *
     * @param commonname user common name
     */
    public void setCommonname(String commonname) {
        this.commonname = commonname;
    }

    /**
     * Get user's username. This name is unique system-wide
     *
     * @return username
     */
    public String getUsername() {
        return username;
    }

    /**
     * Change the user username. This is sensitive operation as this username is used to reference
     * the user within blocks and so on. Final user shouldn't be able to update its name itself.
     *
     * @param username new username
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * @return user accounts
     */
    public List<Account> getAccounts() {
        return accounts;
    }

    /**
     * Set user accounts
     *
     * @param accounts account list
     */
    public void setAccounts(List<Account> accounts) {
        this.accounts = accounts;
    }

    /**
     * @return last seen at
     */
    public Date getLastSeenAt() {
        return new Date(lastSeenAt.getTime());
    }

    /**
     * update most recent activity date of the user
     *
     * @param lastSeenAt the lastSeenAt date
     */
    public void setLastSeenAt(Date lastSeenAt) {
        this.lastSeenAt = new Date(lastSeenAt.getTime());
    }

    /**
     * {@inheritDoc }
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        // nothing to do
    }

}
