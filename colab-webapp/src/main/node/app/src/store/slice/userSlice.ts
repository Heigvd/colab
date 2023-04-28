/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import { Account, HttpSession, User } from 'colab-rest-client';
import * as API from '../../API/api';
import { mapById } from '../../helper';
import { processMessage } from '../../ws/wsThunkActions';
import { AvailabilityStatus } from '../store';

export interface UserState {
  // null user means loading
  users: Record<number, User | 'LOADING' | 'ERROR'>;
  accounts: Record<number, Account>;
  currentHttpSessionsStatus: AvailabilityStatus;
  httpSessions: Record<number, HttpSession>;

  /** did we load all the users related to the current project */
  statusUsersForCurrentProject: AvailabilityStatus;
}

const initialState: UserState = {
  users: {},
  accounts: {},
  currentHttpSessionsStatus: 'NOT_INITIALIZED',
  httpSessions: {},

  statusUsersForCurrentProject: 'NOT_INITIALIZED',
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
    state.httpSessions[session.id] = session;
  }
};
const removeSession = (state: UserState, sessionId: number) => {
  delete state.httpSessions[sessionId];
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.users.upserted.forEach(user => updateUser(state, user));
        action.payload.users.deleted.forEach(entry => removeUser(state, entry.id));
        action.payload.accounts.upserted.forEach(account => updateAccount(state, account));
        action.payload.accounts.deleted.forEach(entry => removeAccount(state, entry.id));
        action.payload.httpSessions.upserted.forEach(session => updateSession(state, session));
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
        state.users[action.meta.arg] = 'LOADING';
      })
      .addCase(API.getUser.fulfilled, (state, action) => {
        if (action.payload?.id != null) {
          state.users[action.meta.arg] = action.payload;
        } else {
          state.users[action.meta.arg] = 'ERROR';
        }
      })
      .addCase(API.getUser.rejected, (state, action) => {
        state.users[action.meta.arg] = 'ERROR';
      })

      .addCase(API.getAllUsers.fulfilled, (state, action) => {
        state.users = mapById(action.payload);
      })

      .addCase(API.getUsersForProject.pending, state => {
        state.statusUsersForCurrentProject = 'LOADING';
      })
      .addCase(API.getUsersForProject.fulfilled, (state, action) => {
        if (action.payload) {
          state.users = { ...state.users, ...mapById(action.payload) };
          state.statusUsersForCurrentProject = 'READY';
        } else {
          state.statusUsersForCurrentProject = 'ERROR';
        }
      })
      .addCase(API.getUsersForProject.rejected, state => {
        state.statusUsersForCurrentProject = 'ERROR';
      })

      .addCase(API.getCurrentUserHttpSessions.pending, state => {
        state.currentHttpSessionsStatus = 'LOADING';
      })
      .addCase(API.getCurrentUserHttpSessions.fulfilled, (state, action) => {
        action.payload.forEach(s => updateSession(state, s));
        state.currentHttpSessionsStatus = 'READY';
      })
      .addCase(API.getCurrentUserHttpSessions.rejected, state => {
        state.currentHttpSessionsStatus = 'ERROR';
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default userSlice.reducer;
