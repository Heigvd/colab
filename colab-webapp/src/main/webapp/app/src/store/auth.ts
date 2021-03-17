/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Account, User } from 'colab-rest-client';

export interface AuthState {
  authenticationStatus: undefined | 'UNAUTHENTICATED' | 'SIGNING_UP' | 'AUTHENTICATED';
  currentUser?: User;
  currentAccount?: Account;
}

const initialState: AuthState = {
  authenticationStatus: undefined,
};

const errorsSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<{ currentUser?: User; currentAccount?: Account }>) => {
      const signedIn = action.payload.currentUser != null && action.payload.currentAccount != null;
      state.authenticationStatus = signedIn ? 'AUTHENTICATED' : 'UNAUTHENTICATED';
      state.currentUser = action.payload.currentUser;
      state.currentAccount = action.payload.currentAccount;
    },
    signOut: state => {
      state.authenticationStatus = 'UNAUTHENTICATED';
      state.currentUser = undefined;
      state.currentAccount = undefined;
    },
    changeAuthenticationStatus: (
      state,
      action: PayloadAction<AuthState['authenticationStatus']>,
    ) => {
      state.authenticationStatus = action.payload;
    },
  },
});

export const { signIn, signOut, changeAuthenticationStatus } = errorsSlice.actions;

export default errorsSlice.reducer;
