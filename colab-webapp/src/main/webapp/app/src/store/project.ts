/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from 'colab-rest-client';

export interface ProjectState {
  [id: number]: Project;
}
const initialState: ProjectState = {};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    initProjects: (_state, action: PayloadAction<Project[]>) => {
      return action.payload.reduce<ProjectState>((acc, current) => {
        if (current.id) {
          acc[current.id] = current;
        }
        return acc;
      }, {});
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      if (action.payload.id != null) {
        state[action.payload.id] = action.payload;
      }
    },
    removeProject: (state, action: PayloadAction<number>) => {
      delete state[action.payload];
    },
  },
});

export const { updateProject, initProjects, removeProject } = projectsSlice.actions;

export default projectsSlice.reducer;
