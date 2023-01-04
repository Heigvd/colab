/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import { UrlMetadata } from 'colab-rest-client';
import * as API from '../../API/api';

export interface ExternalDataState {
  urlMetadata: Record<string, UrlMetadata | 'LOADING'>;
}

const initialState: ExternalDataState = {
  urlMetadata: {},
};

const slice = createSlice({
  name: 'externalData',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(API.refreshUrlMetadata.pending, (state, action) => {
        state.urlMetadata[action.meta.arg] = 'LOADING';
      })
      .addCase(API.refreshUrlMetadata.fulfilled, (state, action) => {
        state.urlMetadata[action.meta.arg] = action.payload;
      })
      .addCase(API.getUrlMetadata.pending, (state, action) => {
        state.urlMetadata[action.meta.arg] = 'LOADING';
      })
      .addCase(API.getUrlMetadata.fulfilled, (state, action) => {
        state.urlMetadata[action.meta.arg] = action.payload;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default slice.reducer;
