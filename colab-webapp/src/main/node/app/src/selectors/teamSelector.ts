/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs, TeamMember, TeamRole } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../API/api';
import { customColabStateEquals, useAppDispatch, useAppSelector } from '../store/hooks';
import { AvailabilityStatus } from '../store/store';
import { selectCurrentProjectId } from './projectSelector';
import { selectCurrentUserId } from './userSelector';

const useProjectTeam = (
  projectId: number | undefined | null,
): {
  members: TeamMember[];
  roles: TeamRole[];
  status: AvailabilityStatus;
} => {
  return useAppSelector(state => {
    const r: { members: TeamMember[]; roles: TeamRole[]; status: AvailabilityStatus } = {
      members: [],
      roles: [],
      status: 'NOT_INITIALIZED',
    };
    if (projectId != null) {
      const team = state.team.teams[projectId];
      if (team) {
        r.status = team.status;
        r.members = Object.values(team.members);
        r.roles = Object.values(team.roles);
      }
    }

    return r;
  }, customColabStateEquals);
};

export const useAndLoadProjectTeam = (
  projectId: number | undefined | null,
): {
  members: TeamMember[];
  roles: TeamRole[];
  status: AvailabilityStatus;
} => {
  const dispatch = useAppDispatch();
  const team = useProjectTeam(projectId);

  React.useEffect(() => {
    if (team.status == 'NOT_INITIALIZED' && projectId != null) {
      dispatch(API.getProjectTeam(projectId));
    }
  }, [dispatch, team.status, projectId]);

  return team;
};

export function useMyMember(
  projectId: number | undefined | null,
  userId: number | undefined | null,
): TeamMember | undefined {
  const team = useAndLoadProjectTeam(projectId);
  if (projectId != null && userId != null) {
    return Object.values(team.members || {}).find(m => m.userId === userId);
  }
  return undefined;
}

export function useMyCurrentMember(): TeamMember | undefined {
  const currentProjectId = useAppSelector(selectCurrentProjectId);
  const currentUserId = useAppSelector(selectCurrentUserId);

  return useMyMember(currentProjectId, currentUserId);
}

export function useIsMyCurrentMemberOwner(): boolean {
  const currentProjectId = useAppSelector(selectCurrentProjectId);
  const currentUserId = useAppSelector(selectCurrentUserId);

  const member = useMyMember(currentProjectId, currentUserId);

  return entityIs(member, 'TeamMember') && member.position === 'OWNER';
}
