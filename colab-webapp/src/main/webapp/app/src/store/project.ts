/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from 'colab-rest-client';
import * as API from '../API/api';

export interface ProjectState {
  status: 'UNSET' | 'LOADING' | 'READY';
  projects: {
    [id: number]: Project;
  };
}
const initialState: ProjectState = {
  status: 'UNSET',
  projects: {},
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
      .addCase(API.initProjects.fulfilled, (_state, action) => {
        return {
          status: 'READY',
          projects: action.payload.reduce<ProjectState['projects']>((acc, current) => {
            if (current.id) {
              acc[current.id] = current;
            }
            return acc;
          }, {}),
        };
      }),
});

export const { updateProject, removeProject } = projectsSlice.actions;

export default projectsSlice.reducer;
