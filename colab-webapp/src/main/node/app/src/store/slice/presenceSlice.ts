/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import { UserPresence } from 'colab-rest-client';
import * as API from '../../API/api';
import { processMessage } from '../../ws/wsThunkActions';
import { AvailabilityStatus } from '../store';

type ProjectId = number;
type WsSessionId = string;

// map by websocket id: one user => many tabs => many presences
export interface ProjectPresence {
  status: AvailabilityStatus;
  presence: Record<WsSessionId, UserPresence>;
}

export interface PresenceState {
  projects: Record<ProjectId, ProjectPresence>;
}

const initialState: PresenceState = {
  projects: {},
};

const getOrCreateProjectState = (state: PresenceState, projectId: number): ProjectPresence => {
  const ps = state.projects[projectId];
  if (ps) {
    return ps;
  } else {
    const nPs: ProjectPresence = {
      status: 'NOT_INITIALIZED',
      presence: {},
    };
    state.projects[projectId] = nPs;
    return nPs;
  }
};

const slice = createSlice({
  name: 'presence',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.presences.upserted.forEach(item => {
          const ps = getOrCreateProjectState(state, item.projectId);
          ps.presence[item.wsSessionId] = item;
        });
        action.payload.presences.deleted.forEach(item => {
          // hack: id of item is the projectId
          const ps = state.projects[item.id];
          if (ps != null && typeof item.payload === 'string') {
            // payload is the wsSessionId
            delete ps.presence[item.payload];
          }
        });
      })
      .addCase(API.getPresenceList.pending, (state, action) => {
        const ps = getOrCreateProjectState(state, action.meta.arg);
        ps.status = 'LOADING';
      })
      .addCase(API.getPresenceList.rejected, (state, action) => {
        const ps = getOrCreateProjectState(state, action.meta.arg);
        ps.status = 'ERROR';
      })
      .addCase(API.getPresenceList.fulfilled, (state, action) => {
        const ps = getOrCreateProjectState(state, action.meta.arg);
        ps.status = 'READY';
        action.payload.forEach(p => {
          ps.presence[p.wsSessionId] = p;
        });
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.closeCurrentSession.fulfilled, () => {
        return initialState;
      }),
});

export default slice.reducer;
