/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WebsocketState {
  sessionId?: string;
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
});

export const { setSessionId } = wsSlice.actions;

export default wsSlice.reducer;
