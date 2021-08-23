/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Project, TeamMember, TeamRole } from 'colab-rest-client';
import { customColabStateEquals, shallowEqual, useAppSelector } from '../store/hooks';
import { StateStatus } from '../store/project';

export interface UsedProject {
  project: Project | null | undefined;
  status: StateStatus;
}

export const useProject = (id: number): UsedProject => {
  return useAppSelector(state => {
    const project = state.projects.projects[id];
    if (project) {
      // project is known
      return {
        project: project,
        status: 'INITIALIZED',
      };
    } else {
      // project is not knwon
      if (state.projects.status === 'INITIALIZED') {
        // state is up to date, such project just does not exist
        return {
          project: null,
          status: `INITIALIZED`,
        };
      } else {
        // this project may or may not exist...
        return {
          project: undefined,
          status: state.projects.status,
        };
      }
    }
  }, shallowEqual);
};

export const useProjectBeingEdited = (): {
  project: Project | null;
  status: 'NOT_EDITING' | 'LOADING' | 'READY';
} => {
  return useAppSelector(state => {
    if (state.projects.editing != null) {
      const project = state.projects.projects[state.projects.editing];
      return {
        project: project || null,
        status: state.projects.editingStatus,
      };
    } else {
      return {
        project: null,
        status: state.projects.editingStatus,
      };
    }
  }, shallowEqual);
};

export const useProjectTeam = (
  projectId: number | undefined | null,
): {
  members: TeamMember[];
  roles: TeamRole[];
  status: StateStatus;
} => {
  return useAppSelector(state => {
    const r: { members: TeamMember[]; roles: TeamRole[]; status: StateStatus } = {
      members: [],
      roles: [],
      status: 'NOT_INITIALIZED',
    };
    if (projectId != null) {
      const team = state.projects.teams[projectId];
      if (team) {
        r.status = team.status;
        r.members = Object.values(team.members);
        r.roles = Object.values(team.roles);
      }
    }

    return r;
  }, customColabStateEquals);
};
