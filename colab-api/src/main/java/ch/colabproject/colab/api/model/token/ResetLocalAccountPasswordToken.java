/*
 * The coLAB project
 * Copyright (C) 2021-2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token;

import ch.colabproject.colab.api.controller.token.TokenManager;
import ch.colabproject.colab.api.model.token.tools.ResetLocalAccountPasswordMessageBuilder;
import ch.colabproject.colab.api.model.user.LocalAccount;
import jakarta.json.bind.annotation.JsonbTransient;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

/**
 * A token to reset the password of a local account
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
    name = "ResetLocalAccountPasswordToken.findByAccountId",
    query = "SELECT t from ResetLocalAccountPasswordToken t where t.localAccount.id =:id")
public class ResetLocalAccountPasswordToken extends Token {

    private static final long serialVersionUID = 1L;

    /**
     * Email subject
     */
    public static final String EMAIL_SUBJECT = "co.LAB account password reset request";

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The local account the token is linked to
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
        if (localAccount != null) {
            return "/settings/user"; // "/settings/account/" + localAccount.getId();
        } else {
            return "";
        }
    }

    @Override
    public boolean consume(TokenManager tokenManager) {
        return tokenManager.consumeResetPasswordToken(localAccount);
    }

    @Override
    public ExpirationPolicy getExpirationPolicy() {
        return ExpirationPolicy.ONE_SHOT;
    }

    // ---------------------------------------------------------------------------------------------
    // to build a message
    // ---------------------------------------------------------------------------------------------

    @JsonbTransient
    @Override
    public String getSubject() {
        return EMAIL_SUBJECT;
    }

    @Override
    public String getEmailBody(String link) {
        return ResetLocalAccountPasswordMessageBuilder.build(this, link);
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public String toString() {
        return "ResetLocalAccountPasswordToken{" + "id=" + getId() + ", localAccount="
            + localAccount + '}';
    }

}
