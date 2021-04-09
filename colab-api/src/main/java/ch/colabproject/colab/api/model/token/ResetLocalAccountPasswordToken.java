/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token;

import ch.colabproject.colab.api.ejb.RequestManager;
import ch.colabproject.colab.api.model.user.LocalAccount;
import java.text.MessageFormat;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.NamedQuery;
import javax.persistence.OneToOne;
import javax.validation.constraints.NotNull;

/**
 * A token to validate the email address of a local account
 *
 * @author maxence
 */
@Entity
@NamedQuery(
    name = "ResetLocalAccountPasswordToken.findByAccountId",
    query = "SELECT t from ResetLocalAccountPasswordToken t where t.localAccount.id =:id")
public class ResetLocalAccountPasswordToken extends Token {

    private static final long serialVersionUID = 1L;

    /**
     * Email subject
     */
    public static final String EMAIL_SUBJECT = "co.LAB account password reset request";

    /**
     * The local account the token is linked to
     */
    @NotNull
    @OneToOne
    @JsonbTransient
    private LocalAccount localAccount;

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

    @Override
    public String getRedirectTo() {
        if (localAccount != null) {
            return "/settings/account/" + localAccount.getId();
        } else {
            return "";
        }
    }

    /**
     * auto-login
     */
    @Override
    public void consume(RequestManager requestManager) {
        requestManager.login(localAccount);
    }

    @Override
    public String getSubject() {
        return EMAIL_SUBJECT;
    }

    @Override
    public String getEmailBody(String link) {
        return MessageFormat.format("Hi {0},<br /><br />"
            + "Click <a href=\"{1}\">here</a> to reset your password.<br /><br />",
            localAccount.getUser().getDisplayName(), link);
    }

    @Override
    public String toString() {
        return "ResetLocalAccountPasswordToken{" + "id=" + getId() + ", localAccount="
            + localAccount + '}';
    }
}
