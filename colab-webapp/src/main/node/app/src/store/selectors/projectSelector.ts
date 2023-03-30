/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { CopyParam, entityIs, Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { shallowEqual, useAppDispatch, useAppSelector, useFetchById, useFetchList } from '../hooks';
import { AvailabilityStatus, ColabState } from '../store';

const selectProjects = (state: ColabState) => state.project.projects;

const selectStatusWhereTeamMember = (state: ColabState) => state.project.statusWhereTeamMember;
export const selectStatusForInstanceableModels = (state: ColabState) =>
  state.project.statusForInstanceableModels;
export const selectStatusForGlobalModels = (state: ColabState) =>
  state.project.statusForGlobalModels;
const selectStatusForAll = (state: ColabState) => state.project.statusForAll;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Sorter
////////////////////////////////////////////////////////////////////////////////////////////////////

// function compareProject(a: Project, b: Project): number {
//   return compareById(a, b);
//   //return sortSmartly(a.name, b.name, lang);
// }

////////////////////////////////////////////////////////////////////////////////////////////////////
// fetch 1 project / model
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
// fetch my projects (excluding models)
////////////////////////////////////////////////////////////////////////////////////////////////////

interface ProjectsAndStatus {
  status: AvailabilityStatus;
  projects?: Project[];
}

function fetchMyProjects(state: ColabState): Project[] {
  return state.team.mine
    .flatMap(id => {
      const p = state.project.projects[id];
      return entityIs(p, 'Project') ? [p] : [];
    })
    .filter(p => p.type !== 'MODEL');
}

export function useMyProjects(): ProjectsAndStatus {
  const { status, data } = useFetchList<Project>(
    selectStatusWhereTeamMember,
    fetchMyProjects,
    API.getMyProjects,
  );
  return { status, projects: data };
}

// interface ProjectsIdsAndStatus {
//   status: AvailabilityStatus;
//   projectsIds?: number[];
// }

// function fetchUserProjectsIds(state: ColabState): number[] {
//   return state.team.mine.flatMap(projectId => {
//     const p = state.project.projects[projectId];
//     if (entityIs(p, 'Project') && p.type !== 'MODEL' && p.id != null) {
//       return [p.id];
//     } else {
//       return [];
//     }
//   });
// }

// export function useUserProjectsIds(): ProjectsIdsAndStatus {
//   const { status, ids } = useFetchListIds(
//     selectStatusWhereTeamMember,
//     fetchUserProjectsIds,
//     API.getUserProjects,
//   );
//   return { status, projectsIds: ids };
// }

////////////////////////////////////////////////////////////////////////////////////////////////////
// fetch all projects including models
////////////////////////////////////////////////////////////////////////////////////////////////////

function fetchAllProjectsAndModels(state: ColabState): Project[] {
  return Object.values(state.project.projects).flatMap(p => {
    return entityIs(p, 'Project') ? [p] : [];
  });
}

export function useAllProjectsAndModels(): ProjectsAndStatus {
  const { status, data } = useFetchList<Project>(
    selectStatusForAll,
    fetchAllProjectsAndModels,
    API.getAllProjectsAndModels,
  );
  return { status, projects: data };
}

// function fetchAllProjectsIds(state: ColabState): number[] {
//   return Object.values(state.project.projects).flatMap(p => {
//     if (entityIs(p, 'Project') && p.id != null) {
//       return [p.id];
//     } else {
//       return [];
//     }
//   });
// }

// export function useAllProjectsIds(): ProjectsIdsAndStatus {
//   const { status, ids } = useFetchListIds(
//     selectStatusForAll,
//     fetchAllProjectsIds,
//     API.getAllProjects,
//   );

//   return { status, projectsIds: ids };
// }

////////////////////////////////////////////////////////////////////////////////////////////////////
// fetch my models
////////////////////////////////////////////////////////////////////////////////////////////////////

function fetchMyModels(state: ColabState): Project[] {
  return Object.values(
    state.team.mine
      .flatMap(id => {
        const p = state.project.projects[id];
        return entityIs(p, 'Project') ? [p] : [];
      })
      .filter(p => p.type === 'MODEL'),
  );
}

export function useMyModels(): ProjectsAndStatus {
  const { status, data } = useFetchList<Project>(
    selectStatusWhereTeamMember,
    fetchMyModels,
    API.getMyProjects,
  );

  return { status, projects: data };
}

export function useHasModels(): boolean {
  const { projects } = useMyModels();
  return projects != null && projects.length > 0;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// fetch my models
////////////////////////////////////////////////////////////////////////////////////////////////////

function useInstanceableModels(): ProjectsAndStatus {
  return useAppSelector(
    state => {
      const projects = state.team.instanceableProjects
        .flatMap(projectId => {
          const p = state.project.projects[projectId];
          return entityIs(p, 'Project') ? [p] : [];
        })
        .filter(p => p.type === 'MODEL');
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
        dispatch(API.getMyProjects());
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
      const projectsIM = state.team.instanceableProjects
        .flatMap(projectId => {
          const p = state.project.projects[projectId];
          return entityIs(p, 'Project') ? [p] : [];
        })
        .filter(p => p.type === 'MODEL');

      // 2. models where the user is a team member of
      const projectsMine = Object.values(
        state.team.mine
          .flatMap(id => {
            const p = state.project.projects[id];
            return entityIs(p, 'Project') ? [p] : [];
          })
          .filter(proj => proj.type === 'MODEL'),
      );

      // 3. models global = accessible by everyone
      const projectsGlobal = Object.values(state.project.projects)
        .flatMap(p => {
          return entityIs(p, 'Project') ? [p] : [];
        })
        .filter(p => p.type === 'MODEL' && p.globalProject === true);

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
