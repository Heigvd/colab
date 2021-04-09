/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {createSlice} from '@reduxjs/toolkit';
import {Account, User} from 'colab-rest-client';
import * as API from '../API/api';

export interface UserState {
  users: {
    // null user means loading
    [id: number]: User | null;
  };
  accounts: {
    [id: number]: Account;
  };
}

const initialState: UserState = {
  users: {},
  accounts: {},
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(API.reloadCurrentUser.fulfilled, (state, action) => {
        const user = action.payload.currentUser;
        const account = action.payload.currentAccount;
        const accounts = action.payload.accounts;

        if (user && user.id != null) {
          state.users[user.id] = user;
        }
        if (accounts != null) {
          const map: {[id: number]: Account} = {};
          accounts.forEach(a => {
            if (a && a.id) {
              map[a.id] = a;
            }
          });
          state.accounts = {...state.accounts, ...map};
        }
        if (account && account.id != null) {
          state.accounts[account.id] = account;
        }
      })
      .addCase(API.updateUser.fulfilled, (state, action) => {
        const user = action.payload;
        if (user.id != null) {
          state.users[user.id] = user;
        }
      })
      .addCase(API.getUser.pending, (state, action) => {
        const userId = action.meta.arg;
        if (userId != null) {
          state.users[userId] = null
        }
      })
      .addCase(API.getUser.fulfilled, (state, action) => {
        const userId = action.payload.id;
        if (userId != null) {
          state.users[userId] = action.payload;
        }
      })
});

export const {} = userSlice.actions;

export default userSlice.reducer;
