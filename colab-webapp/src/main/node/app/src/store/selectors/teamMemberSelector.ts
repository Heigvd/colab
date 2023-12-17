/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs, TeamMember } from 'colab-rest-client';
import * as API from '../../API/api';
import { getDisplayName } from '../../components/team/UserName';
import { sortSmartly } from '../../helper';
import useTranslations, { ColabTranslations, Language, useLanguage } from '../../i18n/I18nContext';
import { useAppSelector, useFetchListWithArg } from '../hooks';
import { AvailabilityStatus, ColabState } from '../store';
import { useAssignmentsForCard } from './assignmentSelector';
import { selectCurrentProjectId } from './projectSelector';
import { compareById } from './selectorHelper';
import { useCurrentUserId, UserAndStatus, useUser } from './userSelector';

interface TeamMembersAndStatus {
  status: AvailabilityStatus;
  members: TeamMember[];
}

interface TeamMemberAndStatus {
  status: AvailabilityStatus;
  member: TeamMember | null;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Sort
////////////////////////////////////////////////////////////////////////////////////////////////////

function compareByPendingVsVerified(a: TeamMember, b: TeamMember): number {
  if (a.userId == null && b.userId != null) {
    return 1;
  }

  if (a.userId != null && b.userId == null) {
    return -1;
  }

  return 0;
}

function compareByUserName(
  i18n: ColabTranslations,
  state: ColabState,
  a: TeamMember,
  b: TeamMember,
  lang: Language,
): number {
  const aUser = a.userId ? state.users.users[a.userId] : null;
  const bUser = b.userId ? state.users.users[b.userId] : null;

  return sortSmartly(
    getDisplayName(i18n, entityIs(aUser, 'User') ? aUser : null, a),
    getDisplayName(i18n, entityIs(bUser, 'User') ? bUser : null, b),
    lang,
  );
}

function compareMembers(
  i18n: ColabTranslations,
  state: ColabState,
  a: TeamMember,
  b: TeamMember,
  lang: Language,
): number {
  // sort pending at the end
  const byPendingVsVerified = compareByPendingVsVerified(a, b);
  if (byPendingVsVerified != 0) {
    return byPendingVsVerified;
  }

  // then by name
  const byUserName = compareByUserName(i18n, state, a, b, lang);
  if (byUserName != 0) {
    return byUserName;
  }

  // then by id to be deterministic
  return compareById(a, b);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select status
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectStatusMembersForCurrentProject(state: ColabState): AvailabilityStatus {
  return state.teamMembers.statusMembersForCurrentProject;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select data
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectMembers(state: ColabState): TeamMember[] {
  return Object.values(state.teamMembers.members).flatMap(member =>
    entityIs(member, 'TeamMember') ? [member] : [],
  );
}

function selectMembersOfCurrentProject(state: ColabState): TeamMember[] {
  const currentProjectId = selectCurrentProjectId(state);

  if (currentProjectId == null) {
    return [];
  }

  return selectMembers(state).filter(m => m.projectId === currentProjectId);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch for current project
////////////////////////////////////////////////////////////////////////////////////////////////////

// sorted, for current project
export function useTeamMembers(): TeamMembersAndStatus {
  const i18n = useTranslations();

  const lang = useLanguage();

  const currentProjectId = useAppSelector(selectCurrentProjectId);

  const { status, data } = useFetchListWithArg<TeamMember, number | null | undefined>(
    selectStatusMembersForCurrentProject,
    selectMembersOfCurrentProject,
    API.getTeamMembersForProject,
    currentProjectId,
  );

  const sortedData = useAppSelector(state =>
    data
      ? data.sort((a, b) => {
          return compareMembers(i18n, state, a, b, lang);
        })
      : data,
  );

  if (currentProjectId == null) {
    return { status: 'ERROR', members: [] };
  }

  return { status, members: sortedData || [] };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetching for a card
////////////////////////////////////////////////////////////////////////////////////////////////////

export function useTeamMembersHavingAssignment(
  cardId: number | undefined | null,
): TeamMembersAndStatus {
  const { status: statusMembers, members } = useTeamMembers();

  const { status: statusAssignments, assignments } = useAssignmentsForCard(cardId);

  if (statusMembers !== 'READY') {
    return { status: statusMembers, members: [] };
  }

  if (statusAssignments !== 'READY') {
    return { status: statusAssignments, members: [] };
  }

  const membersIdsHavingAssignment = assignments.flatMap(assignment =>
    assignment.memberId ? assignment.memberId : [],
  );

  const membersHavingAssignment = members.filter(
    m => m.id && membersIdsHavingAssignment.includes(m.id),
  );

  return { status: 'READY', members: membersHavingAssignment };
}

export function useTeamMembersWithoutAssignment(
  cardId: number | undefined | null,
): TeamMembersAndStatus {
  const { status: statusMembers, members } = useTeamMembers();

  const { status: statusHavingAssignment, members: membersHavingAssignment } =
    useTeamMembersHavingAssignment(cardId);

  if (statusMembers !== 'READY') {
    return { status: statusMembers, members: [] };
  }

  if (statusHavingAssignment !== 'READY') {
    return { status: statusHavingAssignment, members: [] };
  }

  const membersIdsHavingAssignment = membersHavingAssignment.flatMap(m => (m.id ? m.id : []));

  const membersWithoutAssignment = members.filter(
    m => m.id && !membersIdsHavingAssignment.includes(m.id),
  );

  return { status: 'READY', members: membersWithoutAssignment };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch for current project and current user
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectCurrentTeamMember(
  members: TeamMember[] | null | undefined,
  currentUserId: number | null | undefined,
): TeamMember | null | undefined {
  if (!members || !currentUserId) {
    return null;
  }

  const currentMembers = (members || []).filter(m => m.userId === currentUserId);

  if (currentMembers.length !== 1) {
    return null;
  }

  return currentMembers[0];
}

// sorted, for current project and current user
export function useCurrentTeamMember(): TeamMemberAndStatus {
  const { status, members } = useTeamMembers();

  const currentUserId = useCurrentUserId();

  if (status != 'READY') {
    return { status, member: null };
  }

  const currentMember = selectCurrentTeamMember(members, currentUserId);

  if (currentMember == null) {
    return { status: 'ERROR', member: null };
  }

  return {
    status,
    member: currentMember,
  };
}

export function useCurrentTeamMemberId(): number | null {
  const { status, member } = useCurrentTeamMember();

  if (status === 'READY' && member) {
    return member.id || null;
  }

  return null;
}

export function useIsCurrentTeamMemberOwner(): boolean {
  const { member } = useCurrentTeamMember();

  return !!member && member.position === 'OWNER';
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch the user of a team member
////////////////////////////////////////////////////////////////////////////////////////////////////

export function useUserByTeamMember(member: TeamMember): UserAndStatus {
  const userId = member.userId;

  const user = useUser(userId || 0);

  if (userId != null) {
    return user;
  } else {
    // no user id. It is a pending invitation
    return { status: 'READY', user: null };
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
