/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.team;

import ch.colabproject.colab.api.controller.card.CardManager;
import ch.colabproject.colab.api.controller.project.ProjectManager;
import ch.colabproject.colab.api.controller.token.TokenManager;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.team.acl.AccessControl;
import ch.colabproject.colab.api.model.team.acl.HierarchicalPosition;
import ch.colabproject.colab.api.model.team.acl.InvolvementLevel;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.team.TeamMemberDao;
import ch.colabproject.colab.api.persistence.jpa.team.TeamRoleDao;
import ch.colabproject.colab.api.persistence.jpa.team.acl.AccessControlDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.MessageI18nKey;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
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

    /** Team persistence */
    @Inject
    private TeamMemberDao teamMemberDao;

    /** Team persistence */
    @Inject
    private TeamRoleDao teamRoleDao;

    /** Team persistence */
    @Inject
    private AccessControlDao accessControlDao;

    /** Project specific logic handling */
    @Inject
    private ProjectManager projectManager;

    /** Card specific logic handling */
    @Inject
    private CardManager cardManager;

    /** Token Facade */
    @Inject
    private TokenManager tokenManager;

    // *********************************************************************************************
    // find team member
    // *********************************************************************************************

    /**
     * Retrieve the team member. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param memberId the id of the team member
     *
     * @return the team member if found
     *
     * @throws HttpErrorMessage if the team member was not found
     */
    public TeamMember assertAndGetMember(Long memberId) {
        TeamMember member = teamMemberDao.findTeamMember(memberId);

        if (member == null) {
            logger.error("team member #{} not found", memberId);
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_NOT_FOUND);
        }

        return member;
    }

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

        if (project == null) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        if (user != null && findMemberByProjectAndUser(project, user) != null) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        TeamMember teamMember = new TeamMember();

        teamMember.setUser(user);
        teamMember.setProject(project);
        teamMember.setPosition(position);
        project.getTeamMembers().add(teamMember);

        return teamMember;
    }

    /**
     * Get the members of the given project
     *
     * @param projectId the id of the project
     *
     * @return list of team members
     */
    public List<TeamMember> getTeamMembersForProject(Long projectId) {
        logger.debug("Get team members of project #{}", projectId);

        Project project = projectManager.assertAndGetProject(projectId);

        return project.getTeamMembers();
    }

    /**
     * Get all members of the given project
     *
     * @param id id of the project
     *
     * @return all members of the project team
     */
    public List<TeamMember> getTeamMembers(Long id) {
        Project project = projectManager.assertAndGetProject(id);
        logger.debug("Get team members: {}", project);

        return project.getTeamMembers();
    }

    /**
     * Send invitation
     *
     * @param projectId id of the project
     * @param email     send invitation to this address
     *
     * @return the pending new teamMember
     */
    public TeamMember invite(Long projectId, String email) {
        Project project = projectManager.assertAndGetProject(projectId);
        logger.debug("Invite {} to join {}", email, project);
        return tokenManager.sendMembershipInvitation(project, email);
    }

    // *********************************************************************************************
    // Roles
    // *********************************************************************************************

    /**
     * Retrieve the role. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param roleId the id of the role
     *
     * @return the role if found
     *
     * @throws HttpErrorMessage if the role was not found
     */
    public TeamRole assertAndGetRole(Long roleId) {
        TeamRole role = teamRoleDao.findRole(roleId);

        if (role == null) {
            logger.error("team role #{} not found", roleId);
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_NOT_FOUND);
        }

        return role;
    }

    /**
     * Get all the roles defined in the given project
     *
     * @param id the project
     *
     * @return list of roles
     */
    public List<TeamRole> getProjectRoles(Long id) {
        Project project = projectManager.assertAndGetProject(id);
        return project.getRoles();
    }

    /**
     * Get the team roles defined in the given project
     *
     * @param projectId the id of the project
     *
     * @return list of team roles
     */
    public List<TeamRole> getTeamRolesForProject(Long projectId) {
        logger.debug("Get team roles of project #{}", projectId);

        Project project = projectManager.assertAndGetProject(projectId);

        return project.getRoles();
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
            Project project = projectManager.assertAndGetProject(role.getProjectId());
            if (project.getRoleByName(role.getName()) == null) {
                project.getRoles().add(role);
                role.setProject(project);
                return role;
            }
        }
        throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
    }

    /**
     * Delete role
     *
     * @param roleId id of the role to delete
     */
    public void deleteRole(Long roleId) {
        TeamRole role = teamRoleDao.findRole(roleId);
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
            teamRoleDao.deleteRole(role);
        }
    }

    /**
     * Give a role to someone. The role and the member must belong to the very same project.
     *
     * @param roleId   id of the role
     * @param memberId id of the teamMember
     */
    public void giveRole(Long roleId, Long memberId) {
        TeamRole role = teamRoleDao.findRole(roleId);
        TeamMember member = teamMemberDao.findTeamMember(memberId);
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
        TeamRole role = teamRoleDao.findRole(roleId);
        TeamMember member = teamMemberDao.findTeamMember(memberId);
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
    public TeamMember findMemberByProjectAndUser(Project project, User user) {
        return teamMemberDao.findMemberByProjectAndUser(project, user);
    }

    /**
     * Retrieve all users of the team members
     *
     * @param projectId the id of the project
     *
     * @return list of users
     */
    public List<User> getUsersForProject(Long projectId) {
        return getTeamMembersForProject(projectId).stream()
            .filter(m -> {
                return m.getUser() != null;
            })
            .map(m -> {
                return m.getUser();
            })
            .collect(Collectors.toList());
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
        return teamMemberDao.findIfUserAreTeammate(a, b);
    }

    /**
     * Retrieve the acls related to the given project
     *
     * @param projectId the id of the project
     *
     * @return list of access controls
     */
    public List<AccessControl> getAclsForProject(Long projectId) {
        return projectManager.getCards(projectId).stream()
            .flatMap(card -> {
                return getAccessControlList(card.getId()).stream();
            })
            .collect(Collectors.toList());
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
        Card card = cardManager.assertAndGetCard(cardId);
        TeamMember member = teamMemberDao.findTeamMember(memberId);
        if (card != null && member != null) {
            AccessControl ac = card.getAcByMember(member);
            if (level == null) {
                if (ac != null) {
                    deleteAccessControl(ac);
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
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }
    }

    /**
     ** Change a role involvement level regarding to a card. If the given level is null, involvement
     * will be destroyed and effective involvement will be inherited super-card
     *
     * @param cardId id of the card
     * @param roleId id of the role
     * @param level  the level
     */
    public void setInvolvementLevelForRole(Long cardId, Long roleId, InvolvementLevel level) {
        Card card = cardManager.assertAndGetCard(cardId);
        TeamRole role = teamRoleDao.findRole(roleId);
        if (card != null && role != null) {
            AccessControl ac = card.getAcByRole(role);
            if (level == null) {
                if (ac != null) {
                    deleteAccessControl(ac);
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
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }
    }

    /**
     * Delete an access control
     *
     * @param ac the access control to delete
     */
    private void deleteAccessControl(AccessControl ac) {
        logger.trace("delete access control {}", ac);

        if (ac.getMember() != null) {
            ac.getMember().getAccessControlList().remove(ac);
        }

        if (ac.getRole() != null) {
            ac.getRole().getAccessControl().remove(ac);
        }

        if (ac.getCard() != null) {
            ac.getCard().getAccessControlList().remove(ac);
        }

        accessControlDao.deleteAccessControl(ac);

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
        if (card.getDefaultInvolvementLevel() != null) {
            // got it, use it !
            return card.getDefaultInvolvementLevel();
        }

        // No involvement found, neither for the member, nor its roles, nor a default one
        if (card.getParent() != null) {
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
        Card card = cardManager.assertAndGetCard(cardId);
        return card.getAccessControlList();
    }

    /**
     * Update hierarchical position of a member
     *
     * @param memberId id of the member
     * @param position new hierarchical position
     */
    public void updatePosition(Long memberId, HierarchicalPosition position) {
        TeamMember member = teamMemberDao.findTeamMember(memberId);
        if (member != null && position != null) {
            member.setPosition(position);
            assertTeamIntegrity(member.getProject());
        } else {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
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
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }
    }

    /**
     * Delete the given team member
     *
     * @param teamMemberId the id of the team member
     */
    public void deleteTeamMember(Long teamMemberId) {
        TeamMember teamMember = assertAndGetMember(teamMemberId);

        if (!checkDeletionAcceptability(teamMember)) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        // acl deleted by cascade

        // delete invitation token
        tokenManager.deleteInvitationsByTeamMember(teamMember);

        if (teamMember.getProject() != null) {
            teamMember.getProject().getTeamMembers().remove(teamMember);
        }

        teamMemberDao.deleteTeamMember(teamMember);
    }

    /**
     * Ascertain that the team member can be deleted
     *
     * @param teamMember the team member to check for deletion
     *
     * @return True iff it can be safely deleted
     */
    public boolean checkDeletionAcceptability(TeamMember teamMember) {
        if (teamMember.getPosition() == HierarchicalPosition.OWNER &&
            teamMember.getProject().getTeamMembersByPosition(HierarchicalPosition.OWNER)
                .size() < 2) {
            return false;
        }

        return true;
    }
}
