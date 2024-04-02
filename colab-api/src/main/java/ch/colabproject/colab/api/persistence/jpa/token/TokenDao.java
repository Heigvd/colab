/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.token;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.project.InstanceMaker;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.token.*;
import ch.colabproject.colab.api.model.user.LocalAccount;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import java.util.ArrayList;
import java.util.List;

/**
 * Token persistence
 * <p>
 * Note : Most database operations are handled by managed entities and cascade.
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class TokenDao {

    /**
     * logger
     */
    private static final Logger logger = LoggerFactory.getLogger(TokenDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find a token by id
     *
     * @param id the id of the token to fetch
     * @return the token with the given id or null if such a token does not exist
     */
    public Token findToken(Long id) {
        logger.trace("find token #{}", id);

        return em.find(Token.class, id);
    }

    /**
     * Find any VerifyLocalAccountToken linked to the given account.
     *
     * @param account owner of the token
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
     * Find if a pending invitation has already been sent to recipient to join the project
     *
     * @param project   the project
     * @param recipient recipient
     * @return invitation if there is a pending one, null otherwise
     */
    public InvitationToken findInvitationByProjectAndRecipient(Project project, String recipient) {
        try {
            return em
                    .createNamedQuery("InvitationToken.findByProjectAndRecipient",
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
     * @return invitations for the team member
     */
    public List<InvitationToken> findInvitationByTeamMember(TeamMember teamMember) {
        return em.createNamedQuery("InvitationToken.findByTeamMember", InvitationToken.class)

                .setParameter("teamMemberId", teamMember.getId())

                .getResultList();
    }

    /**
     * Find if a pending model sharing token has already been sent to recipient to join the project
     *
     * @param project   the project
     * @param recipient recipient
     * @return model sharing if there is a pending one, null otherwise
     */
    public ModelSharingToken findModelSharingByProjectAndRecipient(Project project,
                                                                   String recipient) {
        try {
            return em.createNamedQuery("ModelSharingToken.findByProjectAndRecipient",
                            ModelSharingToken.class)

                    .setParameter("projectId", project.getId())
                    .setParameter("recipient", recipient)

                    .getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    /**
     * Find model sharing tokens related to an instanceMaker
     *
     * @param instanceMaker the instanceMaker
     * @return list of model sharing related to instanceMaker
     */
    public List<ModelSharingToken> findModelSharingByInstanceMaker(InstanceMaker instanceMaker) {
        try {
            return em.createNamedQuery("ModelSharingToken.findByInstanceMaker",
                            ModelSharingToken.class)

                    .setParameter("instanceMakerId", instanceMaker.getId())
                    .getResultList();
        } catch (NoResultException ex) {
            return null;
        }
    }

    /**
     * Find sharing link tokens related to a project (regardless of if a card is specified or not)
     *
     * @param project the project
     *
     * @return All sharing link tokens related to the project
     */
    public List<SharingLinkToken> findSharingLinkByProject(Project project) {
        try {
            return em.createNamedQuery("SharingLinkToken.findByProject",
                            SharingLinkToken.class)
                    .setParameter("projectId", project.getId())
                    .getResultList();
        } catch (NoResultException ex) {
            return new ArrayList<SharingLinkToken>();
        }
    }

    /**
     * Find sharing link tokens related to a card
     *
     * @param card the card
     *
     * @return All sharing link tokens related to the card
     */
    public List<SharingLinkToken> findSharingLinkByCard(Card card) {
        try {
            return em.createNamedQuery("SharingLinkToken.findByCard", SharingLinkToken.class)
                    .setParameter("cardId", card.getId())
                    .getResultList();
        } catch (NoResultException ex) {
            return new ArrayList<SharingLinkToken>();
        }
    }

//    /**
//     * Update token. Only fields which are editable by users will be impacted.
//     *
//     * @param token the token as supplied by clients (ie not managed by JPA)
//     *
//     * @return return updated managed token
//     *
//     * @throws ColabMergeException if the update failed
//     */
//    public Token updateToken(Token token) throws ColabMergeException {
//        logger.trace("update token {}", token);
//
//        Token managedToken = this.findToken(token.getId());
//
//        managedToken.merge(token);
//
//        return managedToken;
//    }

    /**
     * Persist the token
     *
     * @param token token to persist
     */
    public void persistToken(Token token) {
        logger.trace("persist token {}", token);

        em.persist(token);
    }

    /**
     * Delete the token from database. This can't be undone
     *
     * @param token token to remove
     */
    public void deleteToken(Token token) {
        logger.trace("delete token {}", token);

        em.remove(token);
    }

}
