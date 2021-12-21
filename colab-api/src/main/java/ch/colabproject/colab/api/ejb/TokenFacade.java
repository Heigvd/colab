/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.token.InvitationToken;
import ch.colabproject.colab.api.model.token.ResetLocalAccountPasswordToken;
import ch.colabproject.colab.api.model.token.Token;
import ch.colabproject.colab.api.model.token.VerifyLocalAccountToken;
import ch.colabproject.colab.api.model.user.HashMethod;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.token.TokenDao;
import ch.colabproject.colab.api.service.smtp.Message;
import ch.colabproject.colab.api.service.smtp.Sendmail;
import ch.colabproject.colab.api.setup.ColabConfiguration;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Process tokens
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class TokenFacade {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(TokenDao.class);
    /**
     * to create team member
     */
    @Inject
    private TeamFacade teamFacade;

    /**
     * To check access rights
     */
    @Inject
    private SecurityFacade securityFacade;

    /**
     * Token persistence
     */
    @Inject
    private TokenDao tokenDao;

    /**
     * request context
     */
    @Inject
    private RequestManager requestManager;

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
        logger.debug("Send token {} to {}", token, recipient);
        String plainToken = Helper.generateHexSalt(64);
        HashMethod hashMethod = Helper.getDefaultHashMethod();
        byte[] hashedToken = hashMethod.hash(plainToken, Token.SALT);

        token.setHashMethod(hashMethod);
        token.setHashedToken(hashedToken);

        String baseUrl = requestManager.getBaseUrl();

        // todo generate URL
        String body = token.getEmailBody(baseUrl + "/#/token/" + token.getId()
            + "/" + plainToken);

        String footer = "";
        if (token.getExpirationDate() != null) {
            footer = "<br /><br /><i>This link can be used until "
                + token.getExpirationDate().format(DateTimeFormatter.RFC_1123_DATE_TIME)
                + " GMT</i>";
        }

        // this log message contains sensitive information (body contains the plain-text token)
        logger.trace("Send token {} to {} with body {}", token, recipient, body);
        Sendmail.send(
            Message.create()
                .from("noreply@" + ColabConfiguration.getSmtpDomain())
                .to(recipient)
                .subject(token.getSubject())
                .htmlBody(body + footer)
                .build()
        );
    }

    /**
     * Consume the token
     *
     * @param id         id of the token to consume
     * @param plainToken the plain secret token as sent by e-mail
     *
     * @return the consumed token
     *
     * @throws HttpErrorMessage notFound if the token does not exists; badRequest if token does not
     *                          match; authenticationRequired if token requires authentication but
     *                          current user id not
     */
    public Token consume(Long id, String plainToken) {
        logger.debug("Consume token #{}", id);
        Token token = tokenDao.getToken(id);
        if (token != null) {
            if (token.isAuthenticationRequired() && !requestManager.isAuthenticated()) {
                logger.debug("Token requires an authenticated user");
                throw HttpErrorMessage.authenticationRequired();
            } else {
                if (token.checkHash(plainToken)) {
                    requestManager.sudo(() -> {
                        token.consume(requestManager);
                        tokenDao.deleteToken(token);
                    });
                    return token;
                } else {
                    logger.debug("Provided plain-token does not match");
                    throw HttpErrorMessage.badRequest();
                }
            }
        } else {
            logger.debug("There is no token #{}", id);
            throw HttpErrorMessage.notFound();
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Verify email address
    ////////////////////////////////////////////////////////////////////////////////////////////////
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
    public VerifyLocalAccountToken getOrCreateVerifyAccountToken(LocalAccount account) {
        logger.debug("getOrCreate VerifyToken for {}", account);
        VerifyLocalAccountToken token = tokenDao.findVerifyTokenByAccount(account);

        if (token == null) {
            logger.debug("no token, create one");
            token = new VerifyLocalAccountToken();
            token.setAuthenticationRequired(false);
            token.setLocalAccount(account);
            tokenDao.persistToken(token);
        }
        //token.setExpirationDate(OffsetDateTime.now().plus(1, ChronoUnit.WEEKS));
        token.setExpirationDate(null);

        return token;
    }

    /**
     * Send a "Please verify your email address" message.
     *
     * @param account      account to verify
     * @param failsOnError if false, silent SMTP error
     *
     * @throws HttpErrorMessage smtpError if there is a SMPT error AND failsOnError is set to true
     *                          messageError if the message contains errors (eg. malformed
     *                          addresses)
     */
    public void requestEmailAddressVerification(LocalAccount account, boolean failsOnError) {
        try {
            VerifyLocalAccountToken token = this.getOrCreateVerifyAccountToken(account);
            sendTokenByEmail(token, account.getEmail());
        } catch (MessagingException ex) {
            logger.error("Fails to send email address verification email", ex);
            if (failsOnError) {
                throw HttpErrorMessage.smtpError();
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // RESET PASSWORD
    ////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * get existing reset password token if it exists or create new one otherwise.
     *
     * @param account token owner
     *
     * @return the token to user
     */
    private ResetLocalAccountPasswordToken getOrCreateResetToken(LocalAccount account) {
        logger.debug("getOrCreate Reset for {}", account);
        ResetLocalAccountPasswordToken token = tokenDao.findResetTokenByAccount(account);

        if (token == null) {
            token = new ResetLocalAccountPasswordToken();
            logger.debug("no token, create one");
            token.setAuthenticationRequired(false);
            token.setLocalAccount(account);
            tokenDao.persistToken(token);
        }
        token.setExpirationDate(OffsetDateTime.now().plus(1, ChronoUnit.HOURS));

        return token;
    }

    /**
     * Send a "Click here the reset your password" message.
     *
     * @param account      The account whose password is to be reset
     * @param failsOnError if false, silent SMTP error
     *
     * @throws HttpErrorMessage smtpError if there is a SMPT error AND failsOnError is set to true
     *                          messageError if the message contains errors (eg. malformed
     *                          addresses)
     */
    public void sendResetPasswordToken(LocalAccount account, boolean failsOnError) {
        try {
            logger.debug("Send reset password token to {}", account);
            ResetLocalAccountPasswordToken token = this.getOrCreateResetToken(account);
            sendTokenByEmail(token, account.getEmail());
        } catch (MessagingException ex) {
            logger.error("Failed to send pssword reset email", ex);
            if (failsOnError) {
                throw HttpErrorMessage.smtpError();
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Invite a new team member
    ////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Send invitation to join the project team to the recipient.
     *
     * @param project   the project to join
     * @param recipient email address to send invitation to
     *
     * @return the pending teamMember of null if none was sent
     */
    public TeamMember sendMembershipInvitation(Project project, String recipient) {
        User currentUser = securityFacade.assertAndGetCurrentUser();

        InvitationToken token = tokenDao.findInvitationByProjectAndRecipient(project, recipient);
        if (token == null) {
            // create a member and link it to the project, but do not link it to any user
            // this link will be set during token consumtion
            TeamMember newMember = teamFacade.addMember(project, null,
                HierarchicalPosition.INTERN);
            token = new InvitationToken();

            token.setTeamMember(newMember);
            // never expire
            token.setExpirationDate(null);
            token.setAuthenticationRequired(Boolean.TRUE);
            token.setRecipient(recipient);

            newMember.setDisplayName(recipient);

            tokenDao.persistToken(token);
        }

        token.setSender(currentUser.getDisplayName());
        try {
            sendTokenByEmail(token, recipient);
        } catch (MessagingException ex) {
            logger.error("Failed to send pssword reset email", ex);
            throw HttpErrorMessage.smtpError();
        }
        return token.getTeamMember();
    }

    /**
     * Fetch token with given id from DAO. If it's outdated, it will be destroyed and null will be
     * returned
     *
     * @param id id of the token
     *
     * @return token if it exists and is not outdated, null otherwise
     */
    public Token getNotExpiredToken(Long id) {
        Token token = tokenDao.getToken(id);
        if (token != null && token.isOutdated()) {
            requestManager.sudo(() -> tokenDao.deleteToken(token));
            return null;
        } else {
            return token;
        }
    }
}
