/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.model.user.LocalAccount;
import java.text.MessageFormat;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.Index;
import javax.persistence.NamedQuery;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

/**
 * A token to validate the email address of a local account
 *
 * @author maxence
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "localaccount_id"),
    }
)
@NamedQuery(
    name = "VerifyLocalAccountToken.findByAccountId",
    query = "SELECT t from VerifyLocalAccountToken t where t.localAccount.id =:id")
public class VerifyLocalAccountToken extends Token {

    private static final long serialVersionUID = 1L;

    /**
     * Email subject
     */
    public static final String EMAIL_SUBJECT = "Please validate your co.LAB account";

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The local account the token shall validate
     */
    @OneToOne // FetchType.EAGER is fine
    @NotNull
    @JsonbTransient
    private LocalAccount localAccount;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * Get the value of localAccount
     *
     * @return the value of localAccount
     */
    public LocalAccount getLocalAccount() {
        return localAccount;
    }

    /**
     * Set the value of localAccount
     *
     * @param localAccount new value of localAccount
     */
    public void setLocalAccount(LocalAccount localAccount) {
        this.localAccount = localAccount;
    }

    // ---------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------

    @Override
    public String getRedirectTo() {
        return "/";
    }

    /**
     * Mark the localAccount as verified.
     *
     * @param reqMan the request manager
     */
    @Override
    public void consume(RequestManager reqMan) {
        this.localAccount.setVerified(Boolean.TRUE);
    }

    @Override
    public String getSubject() {
        return EMAIL_SUBJECT;
    }

    @Override
    public String getEmailBody(String link) {
        return MessageFormat.format("Hi {0},<br /><br />"
            + "Please verify your email address: <a href=\"{1}\">verify</a><br /><br />",
            localAccount.getUser().getDisplayName(), link);
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public String toString() {
        return "VerifyLocalAccountToken{" + "id=" + getId()
            + ", localAccount=" + localAccount + '}';
    }

}
