/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AbstractCardType } from 'colab-rest-client';
import * as API from '../API/api';
import { mapById } from '../helper';

export interface CardTypeState {
  // are all types used by the current project known or not ?
  currentProjectStatus: 'UNSET' | 'LOADING' | 'READY';
  // are all types visible by the current user known ?
  //  -> published type from other projects + global published
  publishedStatus: 'UNSET' | 'LOADING' | 'READY';
  // are all global types known (admin ony)
  globalStatus: 'UNSET' | 'LOADING' | 'READY';
  cardtypes: {
    [id: number]: AbstractCardType | null;
  };
}

const initialState: CardTypeState = {
  currentProjectStatus: 'UNSET',
  publishedStatus: 'UNSET',
  globalStatus: 'UNSET',
  cardtypes: {},
};

const cardsSlice = createSlice({
  name: 'cardtypes',
  initialState,
  reducers: {
    updateCardType: (state, action: PayloadAction<AbstractCardType>) => {
      if (action.payload.id != null) {
        state.cardtypes[action.payload.id] = action.payload;
      }
    },
    removeCardType: (state, action: PayloadAction<number>) => {
      delete state.cardtypes[action.payload];
    },
  },
  extraReducers: builder =>
    builder
      .addCase(API.getProjectCardTypes.pending, state => {
        state.currentProjectStatus = 'LOADING';
      })
      .addCase(API.getProjectCardTypes.fulfilled, (state, action) => {
        (state.currentProjectStatus = 'READY'),
          (state.cardtypes = { ...state.cardtypes, ...mapById(action.payload) });
      })
      .addCase(API.getPublishedCardTypes.pending, state => {
        state.publishedStatus = 'LOADING';
      })
      .addCase(API.getPublishedCardTypes.fulfilled, (state, action) => {
        state.publishedStatus = 'READY';
        state.cardtypes = { ...state.cardtypes, ...mapById(action.payload) };
      })
      .addCase(API.getAllGlobalCardTypes.pending, state => {
        state.globalStatus = 'LOADING';
      })
      .addCase(API.getAllGlobalCardTypes.fulfilled, (state, action) => {
        state.globalStatus = 'READY';
        state.cardtypes = { ...state.cardtypes, ...mapById(action.payload) };
      })
      .addCase(API.getCardType.pending, (state, action) => {
        state.cardtypes[action.meta.arg] = null;
      })
      .addCase(API.getCardType.fulfilled, (state, action) => {
        if (action.payload.id) {
          state.cardtypes[action.payload.id] = action.payload;
        }
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export const { updateCardType, removeCardType } = cardsSlice.actions;

export default cardsSlice.reducer;
