/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Project, TeamMember, TeamRole } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../API/api';
import {
  customColabStateEquals,
  shallowEqual,
  useAppDispatch,
  useAppSelector,
} from '../store/hooks';
import { StateStatus } from '../store/project';
import { AvailabilityStatus } from '../store/store';

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

const useProjectTeam = (
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

export const useAndLoadProjectTeam = (
  projectId: number | undefined | null,
): {
  members: TeamMember[];
  roles: TeamRole[];
  status: StateStatus;
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

interface ProjectsAndStatus {
  projects: Project[];
  status: AvailabilityStatus;
}

// TODO sandra work in progress : do what is needed
function useModelProjects(): ProjectsAndStatus {
  const projects = useAppSelector(state => {
    return Object.values(
      state.projects.mine.flatMap(id => {
        const proj = state.projects.projects[id];
        return proj ? [proj] : [];
      }),
    );
  }, shallowEqual);

  return { projects, status: 'READY' };

  // const p3 = useProject(3).project;
  // const p4 = useProject(4).project;
  // const p6 = useProject(6).project;

  // return { projects: [p3!, p4!, p6!], status: 'READY' };
}

// TODO sandra work in progress : really fetch the project models
export function useAndLoadProjectModels(): ProjectsAndStatus {
  const dispatch = useAppDispatch();

  const { projects, status } = useModelProjects();

  if (status === 'NOT_INITIALIZED') {
    dispatch(API.getUserProjects());
  }

  return { projects, status };
}
