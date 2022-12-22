/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs, Project, TeamMember, TeamRole } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../API/api';
import {
  customColabStateEquals,
  shallowEqual,
  useAppDispatch,
  useAppSelector,
} from '../store/hooks';
import { StateStatus } from '../store/slice/projectSlice';
import { AvailabilityStatus } from '../store/store';

export interface ProjectAndStatus {
  project: Project | null;
  status: AvailabilityStatus;
}

export const useProject = (id: number | undefined): ProjectAndStatus => {
  return useAppSelector(state => {
    if (id == null) {
      return {
        project: null,
        status: 'ERROR',
      };
    }
    const project = state.projects.projects[id];
    if (entityIs(project, 'Project')) {
      // project is known
      return {
        project: project,
        status: 'READY',
      };
    } else {
      if (project === 'ERROR') {
        return {
          project: null,
          status: 'ERROR',
        };
      } else {
        return {
          project: null,
          status: project || 'NOT_INITIALIZED',
        };
      }
    }
  }, shallowEqual);
};

export function useAndLoadProject(id: number | undefined): ProjectAndStatus {
  const dispatch = useAppDispatch();

  const { project, status } = useProject(id);

  if (status === 'NOT_INITIALIZED' && id != null) {
    dispatch(API.getProject(id));
  }

  return { project, status };
}

export const useProjectBeingEdited = (): {
  project: Project | null;
  status: 'NOT_EDITING' | 'LOADING' | 'READY';
} => {
  return useAppSelector(state => {
    if (state.projects.editing != null) {
      const project = state.projects.projects[state.projects.editing];
      return {
        project: entityIs(project, 'Project') ? project : null,
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

function useModelProjects(): ProjectsAndStatus {
  const projects = useAppSelector(state => {
    return Object.values(
      state.projects.mine
        .flatMap(id => {
          const proj = state.projects.projects[id];
          return entityIs(proj, 'Project') ? [proj] : [];
        })
        .filter(proj => proj.type === 'MODEL'),
    );
  }, shallowEqual);

  return { projects, status: 'READY' };
}

export function useAndLoadModelProjects(): ProjectsAndStatus {
  const dispatch = useAppDispatch();

  const { projects, status } = useModelProjects();

  if (status === 'NOT_INITIALIZED') {
    dispatch(API.getUserProjects());
  }

  return { projects, status };
}

function useInstanceableModels(): ProjectsAndStatus {
  return useAppSelector(
    state => {
      const projects = state.projects.instanceableProjects.flatMap(projectId => {
        const p = state.projects.projects[projectId];
        if (entityIs(p, 'Project') && p.type === 'MODEL') {
          return [p];
        } else {
          return [];
        }
      });
      return { projects, status: state.projects.statusForInstanceableModels };
    },

    shallowEqual,
  );
}

export function useAndLoadInstanceableModels(): ProjectsAndStatus {
  const dispatch = useAppDispatch();

  const { projects, status } = useInstanceableModels();

  if (status === 'NOT_INITIALIZED') {
    dispatch(API.getInstanceableModels());
  }

  return { projects, status };
}

export function useAndLoadMyAndInstanceableModels(): ProjectsAndStatus {
  const dispatch = useAppDispatch();

  return useAppSelector(
    state => {
      const statusIM = state.projects.statusForInstanceableModels;

      if (statusIM === 'NOT_INITIALIZED') {
        dispatch(API.getInstanceableModels());
      }

      if (statusIM !== 'READY') {
        return {projects: [], status: statusIM};
      }

      const statusMine = state.projects.statusForCurrentUser;

      if (statusMine === 'NOT_INITIALIZED') {
        dispatch(API.getUserProjects());
      }

      if (statusMine !== 'READY') {
        return {projects: [], status: statusMine};
      }

      const projectsIM = state.projects.instanceableProjects.flatMap(projectId => {
        const p = state.projects.projects[projectId];
        if (entityIs(p, 'Project') && p.type === 'MODEL') {
          return [p];
        } else {
          return [];
        }
      });

      const projectsMine = Object.values(
        state.projects.mine
          .flatMap(id => {
            const proj = state.projects.projects[id];
            return entityIs(proj, 'Project') ? [proj] : [];
          })
          .filter(proj => proj.type === 'MODEL'),
      );

      return { projects: [...new Set([...projectsIM,...projectsMine])].flatMap(p => {return p;}), status: 'READY' };
    },

    shallowEqual,
  );
}
