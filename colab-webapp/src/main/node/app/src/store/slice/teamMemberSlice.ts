/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createSlice } from '@reduxjs/toolkit';
import { TeamMember } from 'colab-rest-client';
import * as API from '../../API/api';
import { mapById } from '../../helper';
import { processMessage } from '../../ws/wsThunkActions';
import { AvailabilityStatus, FetchingStatus } from '../store';

/** what we have in the store */
export interface TeamMemberState {
  /** all the members we got so far, by id */
  members: Record<number, FetchingStatus | TeamMember>;

  /** did we load all the members of the current project */
  statusMembersForCurrentProject: AvailabilityStatus;
}

const initialState: TeamMemberState = {
  members: {},

  statusMembersForCurrentProject: 'NOT_INITIALIZED',
};

const teamMemberSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.teamMembers.upserted.forEach(member => {
          if (member.id != null) {
            state.members[member.id] = member;
          }
        });

        action.payload.teamMembers.deleted.forEach(entry => {
          if (entry.id != null) {
            delete state.members[entry.id];
          }
        });
      })

      .addCase(API.getTeamMembersForProject.pending, state => {
        state.statusMembersForCurrentProject = 'LOADING';
      })
      .addCase(API.getTeamMembersForProject.fulfilled, (state, action) => {
        if (action.payload) {
          state.members = { ...state.members, ...mapById(action.payload) };
          state.statusMembersForCurrentProject = 'READY';
        } else {
          state.statusMembersForCurrentProject = 'ERROR';
        }
      })
      .addCase(API.getTeamMembersForProject.rejected, state => {
        state.statusMembersForCurrentProject = 'ERROR';
      })

      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default teamMemberSlice.reducer;
