/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs, TeamRole } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../API/api';
import { sortSmartly } from '../helper';
import { Language, useLanguage } from '../i18n/I18nContext';
import { useAppSelector, useFetchListWithArg } from '../store/hooks';
import { AvailabilityStatus, ColabState } from '../store/store';
import { selectCurrentProjectId } from './projectSelector';
import { compareById } from './selectorHelper';

interface TeamRolesAndStatus {
  status: AvailabilityStatus;
  roles: TeamRole[];
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Sort
////////////////////////////////////////////////////////////////////////////////////////////////////

function compareRoles(a: TeamRole, b: TeamRole, lang: Language): number {
  // sort by name
  const byName = sortSmartly(a.name, b.name, lang);
  if (byName != 0) {
    return byName;
  }

  // then by id to be deterministic
  return compareById(a, b);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select status
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectStatusRolesForCurrentProject(state: ColabState): AvailabilityStatus {
  return state.teamRoles.statusRolesForCurrentProject;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select data
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectRoles(state: ColabState): TeamRole[] {
  return Object.values(state.teamRoles.roles).flatMap(role =>
    entityIs(role, 'TeamRole') ? [role] : [],
  );
}

function selectRolesOfCurrentProject(state: ColabState): TeamRole[] {
  const currentProjectId = selectCurrentProjectId(state);

  if (currentProjectId == null) {
    return [];
  }

  return selectRoles(state).filter(m => m.projectId === currentProjectId);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch for current project
////////////////////////////////////////////////////////////////////////////////////////////////////

// sorted, for current project
export function useTeamRoles(): TeamRolesAndStatus {
  const lang = useLanguage();

  const currentProjectId = useAppSelector(selectCurrentProjectId);

  const { status, data } = useFetchListWithArg<TeamRole, number | null | undefined>(
    selectStatusRolesForCurrentProject,
    selectRolesOfCurrentProject,
    API.getTeamRolesForProject,
    currentProjectId,
  );

  const sortedData = React.useMemo(() => {
    return data
      ? data.sort((a, b) => {
          return compareRoles(a, b, lang);
        })
      : data;
  }, [data, lang]);

  return { status, roles: sortedData || [] };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
