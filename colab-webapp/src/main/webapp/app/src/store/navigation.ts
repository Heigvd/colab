/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NavState {
  status: 'UNINITIALIZED' | 'SYNCING' | 'READY';
}

const initialState: NavState = {
  status: 'UNINITIALIZED',
};

const navSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    goto: (state, action: PayloadAction<NavState['status']>) => {
      state.status = action.payload;
    },
  },
});

export const { goto } = navSlice.actions;

export default navSlice.reducer;
