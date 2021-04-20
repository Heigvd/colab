/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import * as API from '../API/api';

export interface WebsocketState {
  sessionId?: string | null;
}

const initialState: WebsocketState = {};

const wsSlice = createSlice({
  name: 'websockets',
  initialState,
  reducers: {
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
  },
  extraReducers: builder =>
    builder
      .addCase(API.initSocketId.fulfilled, (state, action) => {
        if (action.payload != null) {
          state.sessionId = action.payload.sessionId;
        } else {
          state.sessionId = null;
        }
      })
});

export default wsSlice.reducer;
