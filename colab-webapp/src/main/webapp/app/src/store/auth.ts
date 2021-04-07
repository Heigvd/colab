/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import * as API from '../API/api';

export interface AuthState {
  authenticationStatus: undefined | 'UNAUTHENTICATED' | 'SIGNING_UP' | 'AUTHENTICATED';
  currentUserId?: number;
  currentAccountId?: number;
}

const initialState: AuthState = {
  authenticationStatus: undefined,
};

const authSlice = createSlice({
  name: 'auth',
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
        state.currentUserId = action.payload.currentUser?.id || undefined;
        state.currentAccountId = action.payload.currentAccount?.id || undefined;
      })
      .addCase(API.signOut.fulfilled, state => {
        state.authenticationStatus = 'UNAUTHENTICATED';
        state.currentUserId = undefined;
        state.currentAccountId = undefined;
      }),
});

export const {changeAuthenticationStatus} = authSlice.actions;

export default authSlice.reducer;
