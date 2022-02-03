/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import { Account, HttpSession, User } from 'colab-rest-client';
import * as API from '../API/api';
import { mapById } from '../helper';
import { processMessage } from '../ws/wsThunkActions';
import { LoadingStatus } from './store';

export interface UserState {
  // null user means loading
  users: Record<number, User | null>;
  accounts: Record<number, Account>;
  currentUserSessionState: LoadingStatus;
  sessions: Record<number, HttpSession>;
}

const initialState: UserState = {
  users: {},
  accounts: {},
  currentUserSessionState: 'NOT_INITIALIZED',
  sessions: {},
};

const updateUser = (state: UserState, user: User) => {
  if (user.id != null) {
    state.users[user.id] = user;
  }
};
const removeUser = (state: UserState, userId: number) => {
  delete state.users[userId];
};
const updateAccount = (state: UserState, account: Account) => {
  if (account.id != null) {
    state.accounts[account.id] = account;
  }
};
const removeAccount = (state: UserState, accountId: number) => {
  delete state.accounts[accountId];
};

const updateSession = (state: UserState, session: HttpSession) => {
  if (session.id != null) {
    state.sessions[session.id] = session;
  }
};
const removeSession = (state: UserState, sessionId: number) => {
  delete state.sessions[sessionId];
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.users.updated.forEach(user => updateUser(state, user));
        action.payload.users.deleted.forEach(entry => removeUser(state, entry.id));
        action.payload.accounts.updated.forEach(account => updateAccount(state, account));
        action.payload.accounts.deleted.forEach(entry => removeAccount(state, entry.id));
        action.payload.httpSessions.updated.forEach(session => updateSession(state, session));
        action.payload.httpSessions.deleted.forEach(entry => removeSession(state, entry.id));
      })
      .addCase(API.reloadCurrentUser.fulfilled, (state, action) => {
        const user = action.payload.currentUser;
        const account = action.payload.currentAccount;
        const accounts = action.payload.accounts;

        if (user && user.id != null) {
          state.users[user.id] = user;
        }
        if (accounts != null) {
          state.accounts = { ...state.accounts, ...mapById(accounts) };
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
      .addCase(API.getCurrentUserActiveSessions.pending, state => {
        state.currentUserSessionState = 'LOADING';
      })
      .addCase(API.getCurrentUserActiveSessions.fulfilled, (state, action) => {
        action.payload.forEach(s => updateSession(state, s));
        state.currentUserSessionState = 'READY';
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default userSlice.reducer;
