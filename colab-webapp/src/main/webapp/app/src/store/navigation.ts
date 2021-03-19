/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';

export interface NavState {
  status: 'READY';
}

const initialState: NavState = {
  status: 'READY',
};

const navSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {},
  extraReducers: builder => builder,
});

export default navSlice.reducer;
