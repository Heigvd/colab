/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {createSlice} from '@reduxjs/toolkit';
import * as API from '../API/api';
import {LevelDescriptor} from 'colab-rest-client';

export interface AdminState {
  loggers: {[key: string]: LevelDescriptor} | undefined | null;
}

const initialState: AdminState = {
  loggers: undefined,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
  },
  extraReducers: builder =>
    builder
      .addCase(API.getLoggerLevels.pending, (state) => {
        // undefined means not-loaded
        if (state.loggers === undefined) {
          // null means loading
          state.loggers = null;
        }
      })
      .addCase(API.getLoggerLevels.fulfilled, (state, action) => {
        state.loggers = action.payload;
      }),
});

//export const {...} = adminSlice.actions;

export default adminSlice.reducer;
