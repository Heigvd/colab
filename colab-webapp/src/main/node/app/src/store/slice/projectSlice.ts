/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createSlice } from '@reduxjs/toolkit';
import { CopyParam, Project } from 'colab-rest-client';
import * as API from '../../API/api';
import { mapById } from '../../helper';
import { processMessage } from '../../ws/wsThunkActions';
import { AvailabilityStatus, EditionStatus, FetchingStatus } from '../store';

/** what we have in the store */
export interface ProjectState {
  /** all the projects we got so far, by id */
  projects: Record<number, FetchingStatus | Project>;

  /** did we load all the projects + models where the current user is a team member */
  statusWhereTeamMember: AvailabilityStatus;
  /** did we load all the models linked to the current user with an instance maker */
  statusForInstanceableModels: AvailabilityStatus;
  /** did we load all the global models */
  statusForGlobalModels: AvailabilityStatus;
  /** did we load all the projects */
  statusForAll: AvailabilityStatus;

  /** all the copy param we got so far, by project id */
  copyParams: Record<number, FetchingStatus | CopyParam>; // TODO Sandra 01.2023 - see to make it by copyParam.id

  editing: number | null;
  editingStatus: EditionStatus; // TODO Sandra 01.2023 - see if we can mix editing and editingStatus
}

const initialState: ProjectState = {
  projects: {},

  statusWhereTeamMember: 'NOT_INITIALIZED',
  statusForInstanceableModels: 'NOT_INITIALIZED',
  statusForGlobalModels: 'NOT_INITIALIZED',
  statusForAll: 'NOT_INITIALIZED',

  copyParams: {},

  editing: null,
  editingStatus: 'NOT_EDITING',
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.projects.upserted.forEach(project => {
          if (project.id != null) {
            state.projects[project.id] = project;
          }
        });

        action.payload.projects.deleted.forEach(entry => {
          if (entry.id != null) {
            delete state.projects[entry.id];
          }
        });

        action.payload.copyParam.upserted.forEach(copyParam => {
          if (copyParam.projectId != null) {
            state.copyParams[copyParam.projectId] = copyParam;
          }
        });
        // For no way to fetch copy param deletion. as we deal with projectId as a key
        // No use anyway
      })

      .addCase(API.getProject.pending, (state, action) => {
        state.projects[action.meta.arg] = 'LOADING';
      })
      .addCase(API.getProject.fulfilled, (state, action) => {
        if (action.payload?.id != null) {
          state.projects[action.meta.arg] = action.payload;
        } else {
          state.projects[action.meta.arg] = 'ERROR';
        }
      })
      .addCase(API.getProject.rejected, (state, action) => {
        state.projects[action.meta.arg] = 'ERROR';
      })

      .addCase(API.getMyProjects.pending, state => {
        state.statusWhereTeamMember = 'LOADING';
      })
      .addCase(API.getMyProjects.fulfilled, (state, action) => {
        state.projects = { ...state.projects, ...mapById(action.payload) };
        state.statusWhereTeamMember = 'READY';
      })
      .addCase(API.getMyProjects.rejected, state => {
        state.statusWhereTeamMember = 'ERROR';
      })

      .addCase(API.getInstanceableModels.pending, state => {
        state.statusForInstanceableModels = 'LOADING';
      })
      .addCase(API.getInstanceableModels.fulfilled, (state, action) => {
        state.projects = { ...state.projects, ...mapById(action.payload) };
        state.statusForInstanceableModels = 'READY';
      })
      .addCase(API.getInstanceableModels.rejected, state => {
        state.statusForInstanceableModels = 'ERROR';
      })

      .addCase(API.getAllProjectsAndModels.pending, state => {
        state.statusForAll = 'LOADING';
      })
      .addCase(API.getAllProjectsAndModels.fulfilled, (state, action) => {
        state.projects = mapById(action.payload);
        state.statusForAll = 'READY';
      })
      .addCase(API.getAllProjectsAndModels.rejected, state => {
        state.statusForAll = 'ERROR';
      })

      .addCase(API.getAllGlobalProjects.pending, state => {
        state.statusForGlobalModels = 'LOADING';
      })
      .addCase(API.getAllGlobalProjects.fulfilled, (state, action) => {
        state.projects = { ...state.projects, ...mapById(action.payload) };
        state.statusForGlobalModels = 'READY';
      })
      .addCase(API.getAllGlobalProjects.rejected, state => {
        state.statusForGlobalModels = 'ERROR';
      })

      .addCase(API.getCopyParam.pending, (state, action) => {
        state.copyParams[action.meta.arg] = 'LOADING';
      })
      .addCase(API.getCopyParam.fulfilled, (state, action) => {
        if (action.payload?.id != null) {
          state.copyParams[action.meta.arg] = action.payload;
        } else {
          state.copyParams[action.meta.arg] = 'ERROR';
        }
      })
      .addCase(API.getCopyParam.rejected, (state, action) => {
        state.copyParams[action.meta.arg] = 'ERROR';
      })

      .addCase(API.startProjectEdition.pending, state => {
        state.editingStatus = 'LOADING';
      })
      .addCase(API.startProjectEdition.fulfilled, (state, action) => {
        if (action.payload?.id != null) {
          state.editing = action.payload.id;
        } else {
          state.editing = null;
        }
        state.editingStatus = 'READY';
      })

      .addCase(API.closeCurrentProject.pending, state => {
        state.editing = null;
        state.editingStatus = 'NOT_EDITING';
      })

      .addCase(API.closeCurrentSession.fulfilled, () => {
        return initialState;
      }),
});

export default projectSlice.reducer;
