/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.token;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.token.InvitationToken;
import ch.colabproject.colab.api.model.token.ResetLocalAccountPasswordToken;
import ch.colabproject.colab.api.model.token.Token;
import ch.colabproject.colab.api.model.token.VerifyLocalAccountToken;
import ch.colabproject.colab.api.model.user.LocalAccount;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;

/**
 * Token persistence
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class TokenDao {

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find a token by id
     *
     * @param id id of the token§
     *
     * @return the token if found or null
     */
    public Token findToken(Long id) {
        return em.find(Token.class, id);
    }

    /**
     * Find any VerifyLocalAccountToken linked to the given account.
     *
     * @param account owner of the token
     *
     * @return the token if found. Null otherwise
     */
    public VerifyLocalAccountToken findVerifyTokenByAccount(LocalAccount account) {
        try {
            return em.createNamedQuery("VerifyLocalAccountToken.findByAccountId",
                VerifyLocalAccountToken.class)
                .setParameter("id", account.getId())
                .getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    /**
     * Find any ResetLocalAccountPasswordToken linked to the given account.
     *
     * @param account owner of the token
     *
     * @return the token if found. Null otherwise
     */
    public ResetLocalAccountPasswordToken findResetTokenByAccount(LocalAccount account) {
        try {
            return em.createNamedQuery("ResetLocalAccountPasswordToken.findByAccountId",
                ResetLocalAccountPasswordToken.class)
                .setParameter("id", account.getId())
                .getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    /**
     * Find if an pending invitation has already be sent to recipient to join the project
     *
     * @param project   the project
     * @param recipient recipient
     *
     * @return invitation if there is a pending one, null otherwise
     */
    public InvitationToken findInvitationByProjectAndRecipient(Project project, String recipient) {
        try {
            return em.createNamedQuery("InvitationToken.findByProjectAndRecipient",
                InvitationToken.class)
                .setParameter("projectId", project.getId())
                .setParameter("recipient", recipient)
                .getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    /**
     * Find all pending invitation for a teamMember and a project
     *
     * @param teamMember the team member linked to the invitation token
     *
     * @return invitations for the team member
     */
    public List<InvitationToken> findInvitationByTeamMember(TeamMember teamMember) {
        return em.createNamedQuery("InvitationToken.findByTeamMember",
            InvitationToken.class)
            .setParameter("teamMemberId", teamMember.getId())
            .getResultList();
    }

    /**
     * Persist the token
     *
     * @param token token to persist
     */
    public void persistToken(Token token) {
        // set something to respect notNull constraints
        // otherwise persist will fail
        // These values will be reset when the e-mail is sent.
        if (token.getHashMethod() == null) {
            token.setHashMethod(Helper.getDefaultHashMethod());
        }
        if (token.getHashedToken() == null) {
            token.setHashedToken(new byte[0]);
        }

        em.persist(token);
    }

    /**
     * Delete the given token
     *
     * @param token token to remove
     */
    public void deleteToken(Token token) {
        em.remove(token);
    }
}
