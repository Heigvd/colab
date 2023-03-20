/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.team;

import ch.colabproject.colab.api.controller.card.CardManager;
import ch.colabproject.colab.api.controller.project.ProjectManager;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.acl.Assignment;
import ch.colabproject.colab.api.model.team.acl.InvolvementLevel;
import ch.colabproject.colab.api.persistence.jpa.team.acl.AssignmentDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import java.util.stream.Collectors;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Some logic to manage assignments of team members on cards
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class AssignmentManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(AssignmentManager.class);

    /** Assignments persistence */
    @Inject
    private AssignmentDao assignmentDao;

    /** Team specific logic handling */
    @Inject
    private TeamManager teamManager;

    /** Project specific logic handling */
    @Inject
    private ProjectManager projectManager;

    /** Card specific logic handling */
    @Inject
    private CardManager cardManager;

    // *********************************************************************************************
    // find assignments
    // *********************************************************************************************

    /**
     * Retrieve the assignments related to the given project
     *
     * @param projectId the id of the project
     *
     * @return list of assignments
     */
    public List<Assignment> getAssignmentsForProject(Long projectId) {
        return projectManager.getCards(projectId).stream()
            .flatMap(card -> {
                return getAssignmentsForCard(card.getId()).stream();
            })
            .collect(Collectors.toList());
    }

    /**
     * Get assignments list for the given card
     *
     * @param cardId id of the card
     *
     * @return the of assignments for the given card
     *
     * @throws HttpErrorMessage 404 if the card does not exist
     */
    public List<Assignment> getAssignmentsForCard(Long cardId) {
        Card card = cardManager.assertAndGetCard(cardId);
        return card.getAssignments();
    }

    // *********************************************************************************************
    // create / updated
    // *********************************************************************************************

    /**
     * Set an assignment for a member regarding to a card.
     * <p>
     * For now, at one time, there is only one assignment per card x member
     *
     * @param cardId   id of the card
     * @param memberId id of the member
     * @param level    the level
     */
    public void setAssignment(Long cardId, Long memberId, InvolvementLevel level) {
        Card card = cardManager.assertAndGetCard(cardId);
        TeamMember member = teamManager.assertAndGetMember(memberId);

        Assignment assignment = card.getAssignmentByMember(member);

        if (assignment == null) {
            assignment = new Assignment();

            // set card relationship
            assignment.setCard(card);
            card.getAssignments().add(assignment);

            // set member relationship
            assignment.setMember(member);
            member.getAssignments().add(assignment);
        }

        assignment.setInvolvementLevel(level);
    }

    // *********************************************************************************************
    // deletion
    // *********************************************************************************************

    /**
     * Remove the assignment for a member regarding to a card.
     *
     * @param cardId   id of the card
     * @param memberId id of the member
     */
    public void deleteAssignment(Long cardId, Long memberId) {
        Card card = cardManager.assertAndGetCard(cardId);
        TeamMember member = teamManager.assertAndGetMember(memberId);

        Assignment assignment = card.getAssignmentByMember(member);

        if (assignment != null) {
            deleteAssignment(assignment);
        }

    }

    /**
     * Delete an assignment
     *
     * @param assignment the assignment to delete
     */
    private void deleteAssignment(Assignment assignment) {
        logger.trace("delete assignment {}", assignment);

        if (assignment.getMember() != null) {
            assignment.getMember().getAssignments().remove(assignment);
        }

        if (assignment.getRole() != null) {
            assignment.getRole().getAssignments().remove(assignment);
        }

        if (assignment.getCard() != null) {
            assignment.getCard().getAssignments().remove(assignment);
        }

        assignmentDao.deleteAssignment(assignment);

    }
}
