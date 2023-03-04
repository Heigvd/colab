/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs, TeamMember } from 'colab-rest-client';
import * as API from '../API/api';
import { getDisplayName, sortSmartly } from '../helper';
import { Language } from '../i18n/I18nContext';
import { useAppSelector, useFetchListWithArg } from '../store/hooks';
import { AvailabilityStatus, ColabState, FetchingStatus } from '../store/store';
import { selectCurrentProjectId } from './projectSelector';
import { UserAndStatus, useUser } from './userSelector';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Sorter
////////////////////////////////////////////////////////////////////////////////////////////////////

function compareMembers(state: ColabState, a: TeamMember, b: TeamMember, lang: Language): number {
  if (a.userId == null && b.userId != null) {
    return 1;
  }

  if (a.userId != null && b.userId == null) {
    return -1;
  }

  const aUser = a.userId ? state.users.users[a.userId] : null;
  const bUser = b.userId ? state.users.users[b.userId] : null;

  return sortSmartly(getDisplayName(aUser, a), getDisplayName(bUser, b), lang);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select status
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectStatusForCurrentProject(state: ColabState): AvailabilityStatus {
  return state.teamMembers.statusForCurrentProject;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select data
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectMembersOrStatus(state: ColabState): Record<number, FetchingStatus | TeamMember> {
  return state.teamMembers.members;
}

function selectMembers(state: ColabState): TeamMember[] {
  return Object.values(selectMembersOrStatus(state)).flatMap(member =>
    entityIs(member, 'TeamMember') ? [member] : [],
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch for current project
////////////////////////////////////////////////////////////////////////////////////////////////////

interface StatusAndTeamMembers {
  status: AvailabilityStatus;
  members?: TeamMember[];
}

export function useTeamMembersForCurrentProject(): StatusAndTeamMembers {
  const currentProjectId = useAppSelector(selectCurrentProjectId);

  const { status, data } = useFetchListWithArg<TeamMember, number | null>(
    selectStatusForCurrentProject,
    selectMembers,
    compareMembers,
    API.getTeamMembersForProject,
    currentProjectId,
  );

  return { status, members: data };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Retrieve related data
////////////////////////////////////////////////////////////////////////////////////////////////////

export function useUserByTeamMember(member: TeamMember): UserAndStatus {
  const userId = member.userId;
  const result = useUser(userId || 0);

  if (userId != null) {
    return result;
  } else {
    // no user id. It is a pending invitation
    return { status: 'READY' };
  }
}
