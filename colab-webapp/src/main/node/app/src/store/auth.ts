/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import * as API from '../API/api';
import { PasswordScore } from '../components/common/Form/Form';

export interface AuthState {
  status: 'NOT_INITIALIZED' | 'LOADING' | 'NOT_AUTHENTICATED' | 'AUTHENTICATED';
  currentUserId: number | null;
  currentAccountId: number | null;
  localAccountPasswordScore: PasswordScore | undefined;
}

const initialState: AuthState = {
  status: 'NOT_INITIALIZED',
  currentUserId: null,
  currentAccountId: null,
  localAccountPasswordScore: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    //    changeAuthenticationStatus: (
    //      state,
    //      action: PayloadAction<AuthState['authenticationStatus']>,
    //    ) => {
    //      state.authenticationStatus = action.payload;
    //    },
  },
  extraReducers: builder =>
    builder
      .addCase(API.reloadCurrentUser.pending, state => {
        state.status = 'LOADING';
      })
      .addCase(API.reloadCurrentUser.fulfilled, (state, action) => {
        if (action.payload.currentUser && action.payload.currentAccount) {
          state.currentUserId = action.payload.currentUser.id || null;
          state.currentAccountId = action.payload.currentAccount.id || null;
          state.status = 'AUTHENTICATED';
        } else {
          state.currentUserId = null;
          state.currentAccountId = null;
          state.status = 'NOT_AUTHENTICATED';
        }
      })
      .addCase(API.signInWithLocalAccount.fulfilled, (state, action) => {
        state.localAccountPasswordScore = action.meta.arg.passwordScore;
      })
      .addCase(API.signOut.pending, state => {
        state.status = 'LOADING';
      })
      .addCase(API.signOut.fulfilled, state => {
        state.currentUserId = null;
        state.currentAccountId = null;
        state.status = 'NOT_AUTHENTICATED';
      }),
});

//export const {changeAuthenticationStatus} = authSlice.actions;

export default authSlice.reducer;
