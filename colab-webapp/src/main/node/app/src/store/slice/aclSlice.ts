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
import { AvailabilityStatus } from '../store';

export interface ACLState {
  /** all the acls we got so far, by card id and id */
  acls: Record<
    number,
    {
      status: AvailabilityStatus;
      acl: {
        [id: number]: AccessControl;
      };
    }
  >;

  /** did we load all the acls of the current project */
  statusAclsForCurrentProject: AvailabilityStatus;
}

const initialState: ACLState = {
  acls: {},

  statusAclsForCurrentProject: 'NOT_INITIALIZED',
};

const getOrCreateState = (state: ACLState, cardId: number) => {
  let s = state.acls[cardId];

  if (s != null) {
    return s;
  }
  s = {
    status: 'NOT_INITIALIZED',
    acl: {},
  };
  state.acls[cardId] = s;
  return s;
};

const updateAc = (state: ACLState, ac: AccessControl) => {
  if (ac.id != null && ac.cardId != null) {
    const s = state.acls[ac.cardId];
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
        action.payload.acl.upserted.forEach(ac => updateAc(state, ac));
        action.payload.acl.deleted.forEach(ac => deleteAc(state, ac));
      })

      .addCase(API.getAclsForProject.pending, state => {
        state.statusAclsForCurrentProject = 'LOADING';
      })
      .addCase(API.getAclsForProject.fulfilled, (state, action) => {
        if (action.payload) {
          action.payload.forEach(acl => {
            if (acl.cardId && acl.id) {
              const s = getOrCreateState(state, acl.cardId);
              s.acl[acl.id] = acl;
            }
          });
          state.statusAclsForCurrentProject = 'READY';
        } else {
          state.statusAclsForCurrentProject = 'ERROR';
        }
      })
      .addCase(API.getAclsForProject.rejected, state => {
        state.statusAclsForCurrentProject = 'ERROR';
      })

      .addCase(API.getACLsForCard.pending, (state, action) => {
        const s = getOrCreateState(state, action.meta.arg);
        s.status = 'LOADING';
        s.acl = [];
      })
      .addCase(API.getACLsForCard.fulfilled, (state, action) => {
        const s = getOrCreateState(state, action.meta.arg);
        if (action.payload) {
          s.status = 'READY';
          s.acl = mapById(action.payload);
        } else {
          s.status = 'ERROR';
        }
      })
      .addCase(API.getACLsForCard.rejected, (state, action) => {
        const s = getOrCreateState(state, action.meta.arg);
        s.status = 'ERROR';
        s.acl = [];
      })

      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default aclSlice.reducer;
