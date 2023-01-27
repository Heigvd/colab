/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { CopyParam, entityIs, Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../API/api';
import {
  shallowEqual,
  useAppDispatch,
  useAppSelector,
  useFetchById,
  useFetchList,
} from '../store/hooks';
import { AvailabilityStatus, ColabState } from '../store/store';

const selectProjects = (state: ColabState) => state.project.projects;

export const selectStatusWhereTeamMember = (state: ColabState) =>
  state.project.statusWhereTeamMember;
export const selectStatusForInstanceableModels = (state: ColabState) =>
  state.project.statusForInstanceableModels;
export const selectStatusForGlobalModels = (state: ColabState) =>
  state.project.statusForGlobalModels;
export const selectStatusForAll = (state: ColabState) => state.project.statusForAll;

////////////////////////////////////////////////////////////////////////////////////////////////////
// fetch 1 project
////////////////////////////////////////////////////////////////////////////////////////////////////

interface ProjectAndStatus {
  status: AvailabilityStatus;
  project?: Project;
}

export function useProject(id: number): ProjectAndStatus {
  const { status, data } = useFetchById<Project>(id, selectProjects, API.getProject);
  return { status, project: data };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// fetch current project
////////////////////////////////////////////////////////////////////////////////////////////////////

export const selectEditingStatus = (state: ColabState) => state.project.editingStatus;

export const selectCurrentProjectId = (state: ColabState) => state.project.editing;

export function useCurrentProjectId(): number | null {
  return useAppSelector(selectCurrentProjectId);
}

interface CurrentProjectAndStatus {
  status: AvailabilityStatus | 'NOT_EDITING';
  project?: Project;
}

export function useCurrentProject(): CurrentProjectAndStatus {
  const currentProjectId = useAppSelector(state => selectCurrentProjectId(state));

  const { status, project } = useProject(currentProjectId || 0);
  // TODO Sandra 01.2023 see how to avoid || 0

  if (currentProjectId == null) {
    return { status: 'NOT_EDITING' };
  }

  return { status, project };
}

function selectProject(state: ColabState, id: number): ProjectAndStatus {
  const dataInStore = state.project.projects[id];

  if (dataInStore == null) {
    return { status: 'NOT_INITIALIZED' };
  } else if (typeof dataInStore === 'string') {
    return { status: dataInStore };
  }

  return { status: 'READY', project: dataInStore };
}

export const selectCurrentProject = (state: ColabState): CurrentProjectAndStatus => {
  const currentProjectId = selectCurrentProjectId(state);

  if (currentProjectId == null) {
    return { status: 'NOT_EDITING' };
  }

  return selectProject(state, currentProjectId);
  //return selectData<Project>(state, currentProjectId, state => selectProjects(state));
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// fetch n projects
////////////////////////////////////////////////////////////////////////////////////////////////////

interface ProjectsAndStatus {
  status: AvailabilityStatus;
  projects?: Project[];
}

function fetchUserProjects(state: ColabState): Project[] {
  return state.team.mine.flatMap(projectId => {
    const p = state.project.projects[projectId];
    if (entityIs(p, 'Project') && p.type !== 'MODEL') {
      return [p];
    } else {
      return [];
    }
  });
}

export function useUserProjects(): ProjectsAndStatus {
  const { status, data } = useFetchList<Project>(
    selectStatusWhereTeamMember,
    fetchUserProjects,
    API.getUserProjects,
  );
  return { status, projects: data };
}

function fetchAllProjects(state: ColabState): Project[] {
  return Object.values(state.project.projects).flatMap(p => {
    if (entityIs(p, 'Project')) {
      return [p];
    } else {
      return [];
    }
  });
}

export function useAllProjects(): ProjectsAndStatus {
  const { status, data } = useFetchList<Project>(
    selectStatusForAll,
    fetchAllProjects,
    API.getAllProjects,
  );
  return { status, projects: data };
}

function useModelProjects(): ProjectsAndStatus {
  const projects = useAppSelector(state => {
    return Object.values(
      state.team.mine
        .flatMap(id => {
          const proj = state.project.projects[id];
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

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED') {
      dispatch(API.getUserProjects());
    }
  }, [dispatch, status]);

  return { projects, status };
}

function useInstanceableModels(): ProjectsAndStatus {
  return useAppSelector(
    state => {
      const projects = state.team.instanceableProjects.flatMap(projectId => {
        const p = state.project.projects[projectId];
        if (entityIs(p, 'Project') && p.type === 'MODEL') {
          return [p];
        } else {
          return [];
        }
      });
      return { projects, status: state.project.statusForInstanceableModels };
    },

    shallowEqual,
  );
}

export function useAndLoadInstanceableModels(): ProjectsAndStatus {
  const dispatch = useAppDispatch();

  const { projects, status } = useInstanceableModels();

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED') {
      dispatch(API.getInstanceableModels());
    }
  }, [dispatch, status]);

  return { projects, status };
}

export function useAndLoadMyAndInstanceableModels(): ProjectsAndStatus {
  const dispatch = useAppDispatch();

  return useAppSelector(
    state => {
      // First fetch the statuses of everything we want
      // 1. models where the user is an instance maker for
      const statusIM = state.project.statusForInstanceableModels;

      if (statusIM === 'NOT_INITIALIZED') {
        dispatch(API.getInstanceableModels());
      }

      if (statusIM !== 'READY') {
        return { projects: [], status: statusIM };
      }

      // 2. models where the user is a team member of
      const statusMine = state.project.statusWhereTeamMember;

      if (statusMine === 'NOT_INITIALIZED') {
        dispatch(API.getUserProjects());
      }

      if (statusMine !== 'READY') {
        return { projects: [], status: statusMine };
      }

      // 3. models global = accessible by everyone
      const statusGlobal = state.project.statusForGlobalModels;

      if (statusGlobal === 'NOT_INITIALIZED') {
        dispatch(API.getAllGlobalProjects());
      }

      if (statusGlobal !== 'READY') {
        return { projects: [], status: statusGlobal };
      }

      // Then if all statuses are READY, get the data

      // 1. models where the user is an instance maker for
      const projectsIM = state.team.instanceableProjects.flatMap(projectId => {
        const p = state.project.projects[projectId];
        if (entityIs(p, 'Project') && p.type === 'MODEL') {
          return [p];
        } else {
          return [];
        }
      });

      // 2. models where the user is a team member of
      const projectsMine = Object.values(
        state.team.mine
          .flatMap(id => {
            const proj = state.project.projects[id];
            return entityIs(proj, 'Project') ? [proj] : [];
          })
          .filter(proj => proj.type === 'MODEL'),
      );

      // 3. models global = accessible by everyone
      const projectsGlobal = Object.values(state.project.projects).flatMap(proj => {
        return entityIs(proj, 'Project') && proj.type === 'MODEL' && proj.globalProject === true
          ? [proj]
          : [];
      });

      return {
        projects: [...new Set([...projectsIM, ...projectsMine, ...projectsGlobal])].flatMap(p => {
          return p;
        }),
        status: 'READY',
      };
    },

    shallowEqual,
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// copy param
////////////////////////////////////////////////////////////////////////////////////////////////////

export interface CopyParamAndStatus {
  copyParam: CopyParam | null;
  status: AvailabilityStatus;
}

function useCopyParam(projectId: number): CopyParamAndStatus {
  return useAppSelector(state => {
    const copyParamOrStatus = state.project.copyParams[projectId];

    if (entityIs(copyParamOrStatus, 'CopyParam')) {
      // copyparam is known
      return {
        copyParam: copyParamOrStatus,
        status: 'READY',
      };
    } else {
      return {
        copyParam: null,
        status: copyParamOrStatus || 'NOT_INITIALIZED',
      };
    }
  }, shallowEqual);
}

export function useAndLoadCopyParam(projectId: number): CopyParamAndStatus {
  const dispatch = useAppDispatch();

  const { copyParam, status } = useCopyParam(projectId);

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED' && projectId != null) {
      dispatch(API.getCopyParam(projectId));
    }
  }, [dispatch, projectId, status]);

  return { copyParam, status };
}
