/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import { AccessControl, IndexEntry } from 'colab-rest-client';
import * as API from '../../API/api';
import { mapById } from '../../helper';
import { processMessage } from '../../ws/wsThunkActions';
import { StateStatus } from './projectSlice';

export type ACLState = Record<
  number,
  {
    status: StateStatus;
    acl: {
      [id: number]: AccessControl;
    };
  }
>;

const initialState: ACLState = {};

const getOrCreateState = (state: ACLState, cardId: number) => {
  let s: ACLState[0] | undefined = state[cardId];

  if (s != null) {
    return s;
  }
  s = {
    status: 'NOT_INITIALIZED',
    acl: {},
  };
  state[cardId] = s;
  return s;
};

const updateAc = (state: ACLState, ac: AccessControl) => {
  if (ac.id != null && ac.cardId != null) {
    const s = state[ac.cardId];
    if (s != null) {
      s.acl[ac.id] = ac;
    }
  }
};

const findStateByAcId = (state: ACLState, acId: number) => {
  return Object.values(state).find(entry => {
    return entry.acl[acId] != null;
  });
};

const deleteAc = (state: ACLState, entry: IndexEntry) => {
  if (entry.id != null) {
    const s = findStateByAcId(state, entry.id);
    if (s != null) {
      delete s.acl[entry.id];
    }
  }
};

const aclSlice = createSlice({
  name: 'acl',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.acl.updated.forEach(ac => updateAc(state, ac));
        action.payload.acl.deleted.forEach(ac => deleteAc(state, ac));
      })
      .addCase(API.getACL.pending, (state, action) => {
        const s = getOrCreateState(state, action.meta.arg);
        s.status = 'LOADING';
        s.acl = [];
      })
      .addCase(API.getACL.fulfilled, (state, action) => {
        const s = getOrCreateState(state, action.meta.arg);
        s.status = 'INITIALIZED';
        s.acl = mapById(action.payload);
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default aclSlice.reducer;
