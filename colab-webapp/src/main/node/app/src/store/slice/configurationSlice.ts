/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import { AccountConfig } from 'colab-rest-client';
import * as API from '../../API/api';
import { LoadingStatus } from '../store';

export interface ConfigState {
  accountConfigState: LoadingStatus;
  accountConfig: AccountConfig;
}

const initialState: ConfigState = {
  accountConfigState: 'NOT_INITIALIZED',
  accountConfig: {
    displayCreateLocalAccountButton: false,
  },
};

const slice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(API.getAccountConfig.pending, state => {
        state.accountConfigState = 'LOADING';
      })
      .addCase(API.getAccountConfig.fulfilled, (state, action) => {
        state.accountConfigState = 'READY';
        state.accountConfig = action.payload;
      }),
});

//export const {} = slice.actions;

export default slice.reducer;
