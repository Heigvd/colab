/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createSlice } from '@reduxjs/toolkit';
import { Change, entityIs } from 'colab-rest-client';
import * as API from '../../API/api';
import { processMessage } from '../../ws/wsThunkActions';

export type Status = 'UNSET' | 'LOADING' | 'READY' | 'ERROR';

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
const update = (state: ChangeState, change: Change): ChangeState => {
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
const remove = (state: ChangeState, change: Change): ChangeState => {
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
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.changes.upserted.forEach(change => update(state, change));
        action.payload.changes.deleted.forEach(entry => {
          if (entityIs(entry.payload, 'Change')) {
            remove(state, entry.payload);
          }
        });
      })
      .addCase(API.getBlockPendingChanges.pending, (state, action) => {
        const objectState = getOrCreateObjectState(state, 'TextDataBlock', action.meta.arg);
        objectState.status = 'LOADING';
      })
      .addCase(API.getBlockPendingChanges.fulfilled, (state, action) => {
        const objectState = getOrCreateObjectState(state, 'TextDataBlock', action.meta.arg);
        objectState.status = 'READY';
        action.payload.forEach(change => update(state, change));
      })
      .addCase(API.getBlockPendingChanges.rejected, (state, action) => {
        const objectState = getOrCreateObjectState(state, 'TextDataBlock', action.meta.arg);
        objectState.status = 'ERROR';
      })
      .addCase(API.deletePendingChanges.fulfilled, (state, action) => {
        const objectState = getOrCreateObjectState(state, 'TextDataBlock', action.meta.arg);
        objectState.status = 'UNSET';
        objectState.changes = [];
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default changeSlice.reducer;
