/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs, TeamRole } from 'colab-rest-client';
import * as API from '../API/api';
import { useAppSelector, useFetchListWithArg } from '../store/hooks';
import { AvailabilityStatus, ColabState, FetchingStatus } from '../store/store';
import { selectCurrentProjectId } from './projectSelector';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select status
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectStatusForCurrentProject(state: ColabState): AvailabilityStatus {
  return state.teamRole.statusForCurrentProject;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select data
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectRolesOrStatus(state: ColabState): Record<number, FetchingStatus | TeamRole> {
  return state.teamRole.roles;
}

function selectRoles(state: ColabState): TeamRole[] {
  return Object.values(selectRolesOrStatus(state)).flatMap(role =>
    entityIs(role, 'TeamRole') ? [role] : [],
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch for current project
////////////////////////////////////////////////////////////////////////////////////////////////////

interface StatusAndTeamRoles {
  status: AvailabilityStatus;
  roles?: TeamRole[];
}

export function useTeamRolesForCurrentProject(): StatusAndTeamRoles {
  const currentProjectId = useAppSelector(selectCurrentProjectId);

  const { status, data } = useFetchListWithArg<TeamRole, number | null>(
    selectStatusForCurrentProject,
    selectRoles,
    API.getTeamRolesForProject,
    currentProjectId,
  );

  return { status, roles: data };
}
