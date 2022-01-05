/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.team;

import ch.colabproject.colab.api.controller.token.TokenManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.team.acl.AccessControl;
import ch.colabproject.colab.api.model.team.acl.InvolvementLevel;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.card.CardDao;
import ch.colabproject.colab.api.persistence.project.ProjectDao;
import ch.colabproject.colab.api.persistence.team.TeamDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Stream;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Some logic to manage project teams
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class TeamManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(TeamManager.class);

    /** * Project persistence */
    @Inject
    private ProjectDao projectDao;

    /** * Card persistence */
    @Inject
    private CardDao cardDao;

    /** Team persistence */
    @Inject
    private TeamDao teamDao;

    /** * Token Facade */
    @Inject
    private TokenManager tokenManager;

    // *********************************************************************************************
    // team members
    // *********************************************************************************************
    /**
     * Add given user to the project teams
     *
     * @param project  the project
     * @param user     the user
     * @param position hierarchical position of the user
     *
     * @return the brand new member
     */
    public TeamMember addMember(Project project, User user, HierarchicalPosition position) {
        logger.debug("Add member {} in {}", user, project);
        TeamMember teamMember = new TeamMember();

        // todo check if user is already member of the team
        teamMember.setUser(user);
        teamMember.setProject(project);
        teamMember.setPosition(position);
        project.getTeamMembers().add(teamMember);
        if (user != null) {
            user.getTeamMembers().add(teamMember);
        }
        return teamMember;
    }

    /**
     * Get all members of the given project
     *
     * @param id id of the project
     *
     * @return all members of the project team
     */
    public List<TeamMember> getTeamMembers(Long id) {
        Project project = projectDao.getProject(id);
        logger.debug("Get team members: {}", project);

        if (project == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return project.getTeamMembers();
    }

    /**
     * Send invitation
     *
     * @param projectId if of the project
     * @param email     send invitation to this address
     *
     * @return the pending new teamMember
     */
    public TeamMember invite(Long projectId, String email) {
        Project project = projectDao.getProject(projectId);
        logger.debug("Invite {} to join {}", email, project);
        return tokenManager.sendMembershipInvitation(project, email);
    }

    // *********************************************************************************************
    // Roles
    // *********************************************************************************************
    /**
     * Get all the roles defined in the given project
     *
     * @param id the project
     *
     * @return list of roles
     */
    public List<TeamRole> getProjectRoles(Long id) {
        Project project = projectDao.getProject(id);
        if (project != null) {
            return project.getRoles();
        } else {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
    }

    /**
     * Create a role. The role must have a projectId set.
     *
     * @param role role to create
     *
     * @return the brand new persisted role
     */
    public TeamRole createRole(TeamRole role) {
        if (role.getProjectId() != null) {
            Project project = projectDao.getProject(role.getProjectId());
            if (project != null
                && project.getRoleByName(role.getName()) == null) {
                project.getRoles().add(role);
                role.setProject(project);
                return role;
            }
        }
        throw HttpErrorMessage.relatedObjectNotFoundError();
    }

    /**
     * Update role
     *
     * @param role role to update
     *
     * @return the managed and updated role
     *
     * @throws ch.colabproject.colab.api.exceptions.ColabMergeException if merge failed
     */
    public TeamRole updateRole(TeamRole role) throws ColabMergeException {
        if (role != null) {
            TeamRole managedRole = teamDao.findRole(role.getId());
            if (managedRole != null) {
                managedRole.merge(role);
                return managedRole;
            }
        }
        throw HttpErrorMessage.relatedObjectNotFoundError();
    }

    /**
     * Delete role
     *
     * @param roleId id of the role to delete
     */
    public void deleteRole(Long roleId) {
        TeamRole role = teamDao.findRole(roleId);
        if (role != null) {
            Project project = role.getProject();
            if (project != null) {
                project.getRoles().remove(role);
            }
            role.getMembers().forEach(member -> {
                List<TeamRole> roles = member.getRoles();
                if (roles != null) {
                    roles.remove(role);
                }
            });
            teamDao.removeRole(role);
        }
    }

    /**
     * Give a role to someone. The role and the member must belong to the very same project.
     *
     * @param roleId   id of the role
     * @param memberId id of the teamMember
     */
    public void giveRole(Long roleId, Long memberId) {
        TeamRole role = teamDao.findRole(roleId);
        TeamMember member = teamDao.findTeamMember(memberId);
        if (role != null && member != null) {
            if (Objects.equals(role.getProject(), member.getProject())) {
                List<TeamMember> members = role.getMembers();
                List<TeamRole> roles = member.getRoles();
                if (!members.contains(member)) {
                    members.add(member);
                }
                if (!roles.contains(role)) {
                    roles.add(role);
                }
            } else {
                throw HttpErrorMessage.badRequest();
            }
        }
    }

    /**
     * Remove a role from someone.
     *
     * @param roleId   id of the role
     * @param memberId id of the member
     */
    public void removeRole(Long roleId, Long memberId) {
        TeamRole role = teamDao.findRole(roleId);
        TeamMember member = teamDao.findTeamMember(memberId);
        if (role != null && member != null) {
            List<TeamMember> members = role.getMembers();
            List<TeamRole> roles = member.getRoles();
            members.remove(member);
            roles.remove(role);
        }
    }

    /**
     * Find the teamMember who match the given project and the given user.
     *
     * @param project the project
     * @param user    the user
     *
     * @return the teamMember or null
     */
    public TeamMember findMemberByUserAndProject(Project project, User user) {
        return teamDao.findMemberByUserAndProject(project, user);
    }

    /**
     * Are two user teammate?
     *
     * @param a a user
     * @param b another user
     *
     * @return true if both user are both member of the same team
     */
    public boolean areUserTeammate(User a, User b) {
        return teamDao.areUserTeammate(a, b);
    }

    /**
     * Change a member involvement level regarding to a card. If the given level is null,
     * involvement will be destroyed and effective involvement will be inherited from roles or
     * super-card
     *
     * @param cardId   id of the card
     * @param memberId id of the member
     * @param level    the level
     */
    public void setInvolvementLevelForMember(Long cardId, Long memberId, InvolvementLevel level) {
        Card card = cardDao.getCard(cardId);
        TeamMember member = teamDao.findTeamMember(memberId);
        if (card != null && member != null) {
            AccessControl ac = card.getAcByMember(member);
            if (level == null) {
                if (ac != null) {
                    teamDao.removeAccessControl(ac);
                }
            } else {
                if (ac == null) {
                    ac = new AccessControl();
                    // set card relationship
                    ac.setCard(card);
                    card.getAccessControlList().add(ac);
                    // set member relationship
                    ac.setMember(member);
                    member.getAccessControlList().add(ac);
                }
                ac.setCairoLevel(level);
            }
        } else {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
    }

    /**
     ** Change a role involvement level regarding to a card. If the given level is null,
     * involvement will be destroyed and effective involvement will be inherited super-card
     *
     * @param cardId id of the card
     * @param roleId id of the role
     * @param level  the level
     */
    public void setInvolvementLevelForRole(Long cardId, Long roleId, InvolvementLevel level) {
        Card card = cardDao.getCard(cardId);
        TeamRole role = teamDao.findRole(roleId);
        if (card != null && role != null) {
            AccessControl ac = card.getAcByRole(role);
            if (level == null) {
                if (ac != null) {
                    teamDao.removeAccessControl(ac);
                }
            } else {
                if (ac == null) {
                    ac = new AccessControl();
                    // set card relationship
                    ac.setCard(card);
                    card.getAccessControlList().add(ac);
                    // set role relationship
                    ac.setRole(role);
                    role.getAccessControl().add(ac);
                }
                ac.setCairoLevel(level);
            }
        } else {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

    }

    /**
     * Get the access-control linked to the given member and card
     *
     * @param member the member
     * @param card   card
     *
     * @return the access-control the member has to the card, null if none is defined
     */
    public InvolvementLevel getEffectiveInvolvementLevel(Card card, TeamMember member) {

        // First, try to fetch involvement level from the very card itself
        AccessControl byMember = card.getAcByMember(member);
        if (byMember != null) {
            // There is one level for this member
            return byMember.getCairoLevel();
        }

        // no direct AC defined for the member
        // find all AC defined for member's roles
        Stream<AccessControl> roleStream = member.getRoles().stream()
            .map(role -> card.getAcByRole(role))
            .filter(role -> role != null);

        // As a team member may have several role, it may inherit various AC
        // sorting them give and fetch the first give the most important level
        Optional<AccessControl> first = roleStream.sorted((a, b) -> {
            return a.getCairoLevel().getOrder() - b.getCairoLevel().getOrder();
        }).findFirst();

        if (first.isPresent()) {
            // AC which give the greatest involvement is retained
            AccessControl ac = first.get();
            // The greatest involvement give readonly access
            // but there is a lower involvement which give readwrite access
            if (!ac.getCairoLevel().isRw()
                && roleStream.anyMatch(rac -> rac.getCairoLevel().isRw())
                && ac.getCairoLevel() == InvolvementLevel.CONSULTED_READONLY) {
                // Actually, there is only one case: the member inherit
                // CONSULTED_READONLY & INFORMED_READWRITE from two different roles
                // Effective involvement is CONSULTED_READWRITE
                //
                // There is no other special case (natural order of levels is fine)
                return InvolvementLevel.CONSULTED_READWRITE;
            }

            return ac.getCairoLevel();
        }

        // no involvement found, neither for the member, nor for any of its roles
        // Is the a default one for the card?
        if (card.getDefaultInvolvementLevel()
            != null) {
            // got it, use it !
            return card.getDefaultInvolvementLevel();
        }

        // No involvement found, neither for the member, nor its roles, nor a default one
        if (card.getParent()
            != null) {
            // the card is a sub-card, let's fetch inherit involvement from the card parent
            Card parentCard = card.getParent().getCard();
            if (parentCard != null) {
                return getEffectiveInvolvementLevel(parentCard, member);
            }
        }

        // No involvement at all
        // default level is driven by member hierarchical position
        return member.getPosition()
            .getDefaultInvolvement();
    }

    /**
     * Get access control list for the given card
     *
     * @param cardId id of the card
     *
     * @return the of access control for the given card
     *
     * @throws HttpErrorMessage 404 if the card does not exist
     */
    public List<AccessControl> getAccessControlList(Long cardId) {
        Card card = cardDao.getCard(cardId);
        if (card != null) {
            return card.getAccessControlList();
        } else {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
    }

    /**
     * Update hierarchical position of a member
     *
     * @param memberId id of the member
     * @param position new hierarchical position
     */
    public void updatePosition(Long memberId, HierarchicalPosition position) {
        TeamMember member = teamDao.findTeamMember(memberId);
        if (member != null && position != null) {
            member.setPosition(position);
            assertTeamIntegrity(member.getProject());
        } else {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
    }

    /**
     * Make sure the team of a project make sense. It means:
     * <ul>
     * <li>at least one "owner"
     * </ul>
     *
     * @param project the project to check
     *
     * @throws HttpErrorMessage id team is broken
     */
    public void assertTeamIntegrity(Project project) {

        if (project.getTeamMembersByPosition(HierarchicalPosition.OWNER).isEmpty()) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }
    }

}
