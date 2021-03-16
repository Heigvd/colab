/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.api.model.token.Token;
import ch.colabproject.colab.api.model.token.VerifyLocalAccountToken;
import ch.colabproject.colab.api.model.user.HashMethod;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.service.smtp.Message;
import ch.colabproject.colab.api.service.smtp.Sendmail;
import ch.colabproject.colab.api.setup.ColabConfiguration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.mail.MessagingException;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Process tokens
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class TokenDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(TokenDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * User management provides defaultHashMethod. TODO: move such method to a SecurityHelper
     */
    @Inject
    private UserManagement userManagement;

    /**
     * request context
     */
    @Inject
    private RequestManager requestManager;

    /**
     * Find a token by id
     *
     * @param id id of the token§
     *
     * @return the token if found or null
     */
    public Token getToken(Long id) {
        return em.find(Token.class, id);
    }

    /**
     * Create or update a validation token.
     * <p>
     * If a validate token already exists for the given account, it will be update so there is never
     * more than one validation token per localAccount.
     *
     * @param account token owner
     *
     * @return a brand new token or a refresh
     */
    private VerifyLocalAccountToken getOrCreateValidateAccountToken(LocalAccount account) {
        VerifyLocalAccountToken token;
        try {
            token = em.createNamedQuery("VerifyLocalAccountToken.findByAccountId",
                VerifyLocalAccountToken.class)
                .setParameter("id", account.getId())
                .getSingleResult();
        } catch (NoResultException ex) {
            token = null;
        }

        if (token == null) {
            token = new VerifyLocalAccountToken();
            token.setAuthenticationRequired(false);
            token.setLocalAccount(account);
            // set something to respect notNull contraints
            // otherwise persist will fail
            // These values will be reset when the e-mail is sent.
            token.setHashMethod(userManagement.getDefaultHashMethod());
            token.setHashedToken(new byte[0]);
            em.persist(token);
            // flush to make sure token got an id
            em.flush();
        }
        token.setExpirationDate(LocalDateTime.now().plus(1, ChronoUnit.WEEKS));

        return token;
    }

    /**
     * Finalize initialization of the token and send it to the recipient.
     * <p>
     * As the plain token is not stored in the database, the togen is regenerated in this method.
     *
     * @param token     the token to send
     * @param recipient recipient email address
     *
     * @throws javax.mail.MessagingException if sending the message fails
     */
    public void sendTokenByEmail(Token token, String recipient) throws MessagingException {

        String plainToken = Helper.generateHexSalt(64);
        HashMethod hashMethod = userManagement.getDefaultHashMethod();
        byte[] hashedToken = hashMethod.hash(plainToken, Token.SALT);

        token.setHashMethod(hashMethod);
        token.setHashedToken(hashedToken);

        // todo generate URL
        String body = token.getEmailBody("http://localhost:8080/#token/" + token.getId() + ":" + plainToken);

        logger.trace("Send token {} to {} with body {}", token, recipient, body);
        Sendmail.send(
            Message.create()
                .from("noreply@" + ColabConfiguration.getSmtpDomain())
                .to(recipient)
                .subject(VerifyLocalAccountToken.EMAIL_SUBJECT)
                .htmlBody(body)
                .build()
        );

    }

    /**
     * Send a "Please verify your email address" message
     *
     * @param account      account to verify
     * @param failsOnError if false, silent SMTP error
     *
     * @throws HttpErrorMessage smtpError if there is a SMPT error AND failsOnError is set to true
     *                           messageError if the message contains errors (eg. malformed
     *                           addresses)
     */
    public void requestEmailAddressVerification(LocalAccount account, boolean failsOnError) {
        try {
            VerifyLocalAccountToken token = this.getOrCreateValidateAccountToken(account);
            sendTokenByEmail(token, account.getEmail());
        } catch (MessagingException ex) {
            logger.error("Fails to send email address verification email", ex);
            if (failsOnError) {
                throw HttpErrorMessage.smtpError();
            }
        }
    }

    /**
     * Consume the token
     *
     * @param id         id of the token to consume
     * @param plainToken the plain secret token as sent by e-mail
     *
     * @return the consumed token
     *
     * @throws HttpErrorMessage notFound if the token does not exists; badRequest if token does
     *                           not match; authenticationRequired if token requires authentication
     *                           but current user id not
     */
    public Token consume(Long id, String plainToken) {
        Token token = this.getToken(id);
        if (token != null) {
            if (token.isAuthenticationRequired() && !requestManager.isAuthenticated()) {
                throw HttpErrorMessage.authenticationRequired();
            } else {
                if (token.checkHash(plainToken)) {
                    token.consume();
                    em.remove(token);
                    return token;
                } else {
                    throw HttpErrorMessage.badRequest();
                }
            }
        } else {
            throw HttpErrorMessage.notFound();
        }
    }
}
