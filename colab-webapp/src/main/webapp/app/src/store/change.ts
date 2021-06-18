/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as API from '../API/api';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Change } from 'colab-rest-client';

export type Status = 'UNSET' | 'LOADING' | 'READY';

export interface ChangeState {
  [atClass: string]: {
    [objectId: number]: {
      status: Status;
      changes: Change[];
    };
  };
}

const initialState: ChangeState = {};

const getOrCreateObjectState = (state: ChangeState, atClass: string, objectId: number) => {
  const classState = (state[atClass] = state[atClass] || {});

  const objectState = (classState[objectId] = classState[objectId] || {
    status: 'UNSET',
    changes: [],
  });
  return objectState;
};

export const getObjectState = (
  state: ChangeState,
  atClass: string,
  objectId: number,
): { status: Status; changes: Change[] } | undefined => {
  const classState = state[atClass];

  if (classState != null) {
    return classState[objectId];
  }
};

/**
 * Insert new change by mutating the state
 */
export const updateChange = (state: ChangeState, change: Change): ChangeState => {
  if (change.atClass != null && change.atId != null) {
    const oState = getOrCreateObjectState(state, change.atClass, change.atId);

    if (oState.status != 'UNSET') {
      const changes = oState.changes;
      const idx = changes.findIndex(c => c.revision === change.revision);

      if (idx >= 0) {
        changes.splice(idx, 1, change);
      } else {
        changes.push(change);
      }
    }
  }
  return state;
};

/**
 * Remove change by mutating the state
 */
export const removeChange = (state: ChangeState, change: Change): ChangeState => {
  if (change.atClass != null && change.atId != null) {
    const objectState = getObjectState(state, change.atClass, change.atId);

    if (objectState != null) {
      const changes = objectState.changes;

      const idx = changes.findIndex(c => c.revision === change.revision);

      if (idx >= 0) {
        changes.splice(idx, 1);
      }
    }
  }
  return state;
};

const changeSlice = createSlice({
  name: 'changes',
  initialState,
  reducers: {
    updateChanges: (state, action: PayloadAction<Change[]>) => {
      action.payload.forEach(change => updateChange(state, change));
    },
    deleteChanges: (state, action: PayloadAction<Change[]>) => {
      action.payload.forEach(change => removeChange(state, change));
    },
  },
  extraReducers: builder =>
    builder
      .addCase(API.getBlockPendingChanges.pending, (state, action) => {
        const objectState = getOrCreateObjectState(state, 'TextDataBlock', action.meta.arg);
        objectState.status = 'LOADING';
      })
      .addCase(API.getBlockPendingChanges.fulfilled, (state, action) => {
        const objectState = getOrCreateObjectState(state, 'TextDataBlock', action.meta.arg);
        objectState.status = 'READY';
        action.payload.forEach(change => updateChange(state, change));
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export const { updateChanges, deleteChanges } = changeSlice.actions;

export default changeSlice.reducer;
