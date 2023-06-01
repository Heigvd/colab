/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import { ColabConfig } from 'colab-rest-client';
import * as API from '../../API/api';
import { LoadingStatus } from '../store';

export interface ConfigState {
  configState: LoadingStatus;
  config: ColabConfig;
}

const initialState: ConfigState = {
  configState: 'NOT_INITIALIZED',
  config: {
    displayCreateLocalAccountButton: false,
    yjsApiEndpoint: '',
  },
};

const slice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(API.getConfig.pending, state => {
        state.configState = 'LOADING';
      })
      .addCase(API.getConfig.fulfilled, (state, action) => {
        state.configState = 'READY';
        state.config = action.payload;
      }),
});

//export const {} = slice.actions;

export default slice.reducer;
