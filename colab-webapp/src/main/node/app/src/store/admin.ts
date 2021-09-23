/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ChannelOverview,
  entityIs,
  LevelDescriptor,
  WebsocketEffectiveChannel,
} from 'colab-rest-client';
import * as API from '../API/api';

export interface AdminState {
  loggers: { [key: string]: LevelDescriptor } | undefined | null;
  userStatus: 'NOT_INITIALIZED' | 'LOADING' | 'INITIALIZED';
  occupiedChannels: ChannelOverview[] | 'NOT_INITIALIZED' | 'LOADING';
}

const initialState: AdminState = {
  loggers: undefined,
  userStatus: 'NOT_INITIALIZED',
  occupiedChannels: 'NOT_INITIALIZED',
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    channelUpdate: (
      state,
      action: PayloadAction<{ channel: WebsocketEffectiveChannel; diff: number }>,
    ) => {
      if (typeof state.occupiedChannels != 'string') {
        const channel = action.payload.channel;
        const count = action.payload.diff;

        const index = state.occupiedChannels.findIndex(item => {
          if (entityIs(channel, 'UserChannel') && entityIs(item.channel, 'UserChannel')) {
            return channel.userId === item.channel.userId;
          } else if (
            entityIs(channel, 'ProjectContentChannel') &&
            entityIs(item.channel, 'ProjectContentChannel')
          ) {
            return channel.projectId === item.channel.projectId;
          } else {
            return false;
          }
        });

        if (index >= 0) {
          const found = state.occupiedChannels[index];
          if (found != null) {
            // channel exists
            const newCount = found.count + count;
            if (newCount > 0) {
              // update channel
              found.count = newCount;
            } else {
              // remove channel
              state.occupiedChannels.splice(index, 1);
            }
          }
        } else if (count > 0) {
          state.occupiedChannels.push({
            '@class': 'ChannelOverview',
            channel: channel,
            count: count,
          });
        }
      }
    },
  },
  extraReducers: builder =>
    builder
      .addCase(API.getAllUsers.pending, state => {
        state.userStatus = 'LOADING';
      })
      .addCase(API.getAllUsers.fulfilled, state => {
        state.userStatus = 'INITIALIZED';
      })
      .addCase(API.getLoggerLevels.pending, state => {
        // undefined means not-loaded
        if (state.loggers === undefined) {
          // null means loading
          state.loggers = null;
        }
      })
      .addCase(API.getLoggerLevels.fulfilled, (state, action) => {
        state.loggers = action.payload;
      })
      .addCase(API.getOccupiedChannels.pending, state => {
        state.occupiedChannels = 'LOADING';
      })
      .addCase(API.getOccupiedChannels.fulfilled, (state, action) => {
        state.occupiedChannels = action.payload;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export const { channelUpdate } = adminSlice.actions;

export default adminSlice.reducer;
