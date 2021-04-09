/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {createSlice} from '@reduxjs/toolkit';
import * as API from '../API/api';

export interface AuthState {
  //authenticationStatus: 'UNKNOWN' | 'UNAUTHENTICATED' | 'AUTHENTICATED';
  currentUserId: number | null | undefined;
  currentAccountId?: number | null | undefined;
}

const initialState: AuthState = {
  //authenticationStatus: 'UNKNOWN',
  currentUserId: undefined,
  currentAccountId: undefined,
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
      .addCase(API.reloadCurrentUser.fulfilled, (state, action) => {
        //const signedIn =
        //  action.payload.currentUser != null && action.payload.currentAccount != null;
        //state.authenticationStatus = signedIn ? 'AUTHENTICATED' : 'UNAUTHENTICATED';
        state.currentUserId = action.payload.currentUser?.id || null;
        state.currentAccountId = action.payload.currentAccount?.id || null;
      })
      .addCase(API.signOut.fulfilled, state => {
        //state.authenticationStatus = 'UNAUTHENTICATED';
        state.currentUserId = null;
        state.currentAccountId = null;
      }),
});

//export const {changeAuthenticationStatus} = authSlice.actions;

export default authSlice.reducer;
