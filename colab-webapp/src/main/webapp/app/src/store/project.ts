/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, TeamMember } from 'colab-rest-client';
import * as API from '../API/api';
import { mapById } from '../helper';

/**
 * NOT_SET: the state is not fully set. It may contain some data (received by websocket) but there
 *          is no guarantee it contains all data
 * LOADING: request to load all data is pending
 * SET:     all data are known
 */
export type StateStatus = 'NOT_SET' | 'LOADING' | 'SET';

export interface ProjectState {
  currentUserId: number | undefined;
  status: StateStatus;
  allStatus: StateStatus;
  mine: number[];
  projects: {
    [id: number]: Project;
  };
  teams: {
    [id: number]: {
      status: StateStatus;
      members: {
        [id: number]: TeamMember;
      };
    };
  };
  editing: number | null;
}
const initialState: ProjectState = {
  currentUserId: undefined,
  status: 'NOT_SET',
  allStatus: 'NOT_SET',
  mine: [],
  projects: {},
  teams: {},
  editing: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    updateProject: (state, action: PayloadAction<Project>) => {
      if (action.payload.id != null) {
        state.projects[action.payload.id] = action.payload;
      }
    },
    removeProject: (state, action: PayloadAction<number>) => {
      const mineIndex = state.mine.indexOf(action.payload);
      if (mineIndex >= 0) {
        state.mine.splice(mineIndex, 1);
      }

      delete state.projects[action.payload];
    },
    updateTeamMember: (state, action: PayloadAction<TeamMember>) => {
      const projectId = action.payload.projectId;
      const mId = action.payload.id;

      const userId = action.payload.userId;
      if (projectId != null && userId != null && userId === state.currentUserId) {
        if (state.mine.indexOf(projectId) == -1) {
          state.mine.push(projectId);
        }
      }

      if (projectId != null && mId != null) {
        const team = state.teams[projectId];
        if (team != null && team.status === 'SET') {
          team.members[mId] = action.payload;
        }
      }
    },
    removeTeamMember: (state, action: PayloadAction<number>) => {
      Object.values(state.teams).forEach(team => {
        if (team.members[action.payload]) {
          delete team.members[action.payload];
        }
      });
    },
  },
  extraReducers: builder =>
    builder
      .addCase(API.reloadCurrentUser.fulfilled, (state, action) => {
        // hack: to build state.mine projects, currentUserId must be known
        state.currentUserId = action.payload.currentUser
          ? action.payload.currentUser.id || undefined
          : undefined;
      })
      .addCase(API.getUserProjects.pending, state => {
        state.status = 'LOADING';
      })
      .addCase(API.getUserProjects.fulfilled, (state, action) => {
        state.status = 'SET';
        state.mine = action.payload.flatMap(project => (project.id != null ? [project.id] : []));
        state.projects = { ...state.projects, ...mapById(action.payload) };
      })
      .addCase(API.getAllProjects.pending, state => {
        state.allStatus = 'LOADING';
      })
      .addCase(API.getAllProjects.fulfilled, (state, action) => {
        state.allStatus = 'SET';
        state.projects = mapById(action.payload);
      })
      .addCase(API.getProjectTeam.pending, (state, action) => {
        const projectId = action.meta.arg;
        if (projectId) {
          state.teams[projectId] = state.teams[projectId] || { status: 'NOT_SET', members: {} };
          state.teams[projectId].status = 'LOADING';
        }
      })
      .addCase(API.getProjectTeam.fulfilled, (state, action) => {
        const projectId = action.meta.arg;
        if (projectId) {
          state.teams[projectId].status = 'SET';
          if (action.payload) {
            state.teams[projectId].members = mapById(action.payload);
          }
        }
      })
      //      .addCase(API.createProject.fulfilled, (state, action) => {
      //        state.mine.push(action.payload);
      //      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      })
      .addCase(API.closeCurrentProject.fulfilled, state => {
        state.editing = null;
      })
      .addCase(API.startProjectEdition.fulfilled, (state, action) => {
        if (action.payload.id != null) {
          state.editing = action.payload.id;
        } else {
          state.editing = null;
        }
      }),
});

export const {
  updateProject,
  removeProject,
  updateTeamMember,
  removeTeamMember,
} = projectsSlice.actions;

export default projectsSlice.reducer;
