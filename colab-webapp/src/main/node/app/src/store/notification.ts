/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HttpException } from 'colab-rest-client';
import { processMessage } from '../ws/wsThunkActions';

export interface ColabNotification {
  status: 'OPEN' | 'CLOSED';
  type: 'INFO' | 'WARN' | 'ERROR';
  message: HttpException | string | null;
}

const initialState: ColabNotification[] = [];

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<ColabNotification>) => {
      state.push(action.payload);
    },
    closeNotification: (state, action: PayloadAction<number>) => {
      const notif = state[action.payload];
      if (notif) {
        notif.status = 'CLOSED';
      }
    },
  },
  extraReducers: builder =>
    builder.addCase(processMessage.fulfilled, (state, action) => {
      action.payload.notifications.forEach(error => state.push(error));
    }),
});

export const { addNotification, closeNotification } = slice.actions;

export default slice.reducer;
