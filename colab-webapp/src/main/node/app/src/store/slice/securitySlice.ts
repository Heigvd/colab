/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { LoadingStatus } from '../store';
import { createSlice } from '@reduxjs/toolkit';
import * as API from '../../API/api';

export interface SecurityState {
  securityState: LoadingStatus;
  termsOfUseAndDataPolicyTime: number;
}

const initialState: SecurityState = {
  securityState: 'NOT_INITIALIZED',
  termsOfUseAndDataPolicyTime: 0,
};

const slice = createSlice({
  name: 'security',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(API.getTosAndDataPolicyTime.pending, state => {
        state.securityState = 'LOADING';
      })
      .addCase(API.getTosAndDataPolicyTime.fulfilled, (state, action) => {
        state.securityState = 'READY';
        state.termsOfUseAndDataPolicyTime = action.payload;
      })
      .addCase(API.closeCurrentSession.fulfilled, () => {
        return initialState;
      }),
});

export default slice.reducer;
