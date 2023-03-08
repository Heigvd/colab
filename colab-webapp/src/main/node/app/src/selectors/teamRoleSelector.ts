/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs, TeamRole } from 'colab-rest-client';
import * as API from '../API/api';
import { sortSmartly } from '../helper';
import { Language, useLanguage } from '../i18n/I18nContext';
import { useAppSelector, useFetchListWithArg } from '../store/hooks';
import { AvailabilityStatus, ColabState, FetchingStatus } from '../store/store';
import { selectCurrentProjectId } from './projectSelector';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Sorter
////////////////////////////////////////////////////////////////////////////////////////////////////

function compareRoles(_state: ColabState, a: TeamRole, b: TeamRole, lang: Language): number {
  return sortSmartly(a.name || '' + a.id, b.name || '' + b.id, lang);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select status
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectStatusForCurrentProject(state: ColabState): AvailabilityStatus {
  return state.teamRoles.statusForCurrentProject;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select data
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectRolesOrStatus(state: ColabState): Record<number, FetchingStatus | TeamRole> {
  return state.teamRoles.roles;
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
  const lang = useLanguage();

  const currentProjectId = useAppSelector(selectCurrentProjectId);

  const { status, data } = useFetchListWithArg<TeamRole, number | null>(
    selectStatusForCurrentProject,
    selectRoles,
    API.getTeamRolesForProject,
    currentProjectId,
  );

  const sortedData = useAppSelector(state =>
    data
      ? data.sort((a, b) => {
          return compareRoles(state, a, b, lang);
        })
      : data,
  );

  return { status, roles: sortedData };
}
