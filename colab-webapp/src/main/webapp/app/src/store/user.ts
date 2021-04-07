/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Account, User } from 'colab-rest-client';
import * as API from '../API/api';

export interface AuthState {
  authenticationStatus: undefined | 'UNAUTHENTICATED' | 'SIGNING_UP' | 'AUTHENTICATED';
  currentUser?: User;
  currentAccount?: Account;
}

const initialState: AuthState = {
  authenticationStatus: undefined,
};

const authSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    changeAuthenticationStatus: (
      state,
      action: PayloadAction<AuthState['authenticationStatus']>,
    ) => {
      state.authenticationStatus = action.payload;
    },
  },
  extraReducers: builder =>
    builder
      .addCase(API.reloadCurrentUser.fulfilled, (state, action) => {
        const signedIn =
          action.payload.currentUser != null && action.payload.currentAccount != null;
        state.authenticationStatus = signedIn ? 'AUTHENTICATED' : 'UNAUTHENTICATED';
        state.currentUser = action.payload.currentUser;
        state.currentAccount = action.payload.currentAccount;
      })
      .addCase(API.signOut.fulfilled, state => {
        state.authenticationStatus = 'UNAUTHENTICATED';
        state.currentUser = undefined;
        state.currentAccount = undefined;
      }),
});

export const { changeAuthenticationStatus } = authSlice.actions;

export default authSlice.reducer;
