/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Project, TeamMember} from 'colab-rest-client';
import * as API from '../API/api';

/**
 * NOT_SET: the state is not fully set. It may contain some data (received by websocket) but there is
 *          not guarantee it containrs all data
 * LOADING: request to load all data is pending
 * SET:     all data are known
 */
export type StateStatus = 'NOT_SET' | 'LOADING' | 'SET';

export interface ProjectState {
  status: StateStatus;
  projects: {
    [id: number]: Project;
  };
  teams: {
    [id: number]: {
      status: StateStatus;
      members: TeamMember[]
    }
  }
}
const initialState: ProjectState = {
  status: 'NOT_SET',
  projects: {},
  teams: {},
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
      delete state.projects[action.payload];
    },
  },
  extraReducers: builder =>
    builder
      .addCase(API.initProjects.pending, state => {
        state.status = 'LOADING';
      })
      .addCase(API.initProjects.fulfilled, (state, action) => {
        return {
          ...state,
          status: 'SET',
          projects: action.payload.reduce<ProjectState['projects']>((acc, current) => {
            if (current.id) {
              acc[current.id] = current;
            }
            return acc;
          }, {}),
        };
      })
      .addCase(API.getProjectTeam.pending, (state, action) => {
        const projectId = action.meta.arg;
        if (projectId) {
          state.teams[projectId] = state.teams[projectId] || {status: 'NOT_SET', members: []};
          state.teams[projectId].status = 'LOADING'
        }
      })
      .addCase(API.getProjectTeam.fulfilled, (state, action) => {
        const projectId = action.meta.arg;
        if (projectId) {
          state.teams[projectId].status = 'SET';
          if (action.payload) {
            state.teams[projectId].members = [...action.payload];
          }
        }
      }),
});

export const {updateProject, removeProject} = projectsSlice.actions;

export default projectsSlice.reducer;
