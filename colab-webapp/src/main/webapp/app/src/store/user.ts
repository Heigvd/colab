/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Account, User } from 'colab-rest-client';
import * as API from '../API/api';
import { mapById } from '../helper';

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
  reducers: {
    updateUser: (state, action: PayloadAction<User>) => {
      if (action.payload.id != null) {
        state.users[action.payload.id] = action.payload;
      }
    },
    removeUser: (state, action: PayloadAction<number>) => {
      delete state.users[action.payload];
    },
    updateAccount: (state, action: PayloadAction<Account>) => {
      if (action.payload.id != null){
        state.accounts[action.payload.id] = action.payload;
      }
    },
    removeAccount: (state, action: PayloadAction<number>) => {
      delete state.accounts[action.payload];
    },
  },
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
          const map: { [id: number]: Account } = {};
          accounts.forEach(a => {
            if (a && a.id) {
              map[a.id] = a;
            }
          });
          state.accounts = { ...state.accounts, ...map };
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
          state.users[userId] = null;
        }
      })
      .addCase(API.getUser.fulfilled, (state, action) => {
        const userId = action.payload.id;
        if (userId != null) {
          state.users[userId] = action.payload;
        }
      })
      .addCase(API.getAllUsers.fulfilled, (state, action) => {
        state.users = mapById(action.payload);
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export const {updateUser, removeUser, updateAccount, removeAccount } = userSlice.actions;

export default userSlice.reducer;
