/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CardDef } from 'colab-rest-client';
import * as API from '../API/api';
import { mapById } from '../helper';

export interface CardDefState {
  status: 'UNSET' | 'LOADING' | 'READY';
  carddefs: {
    [id: number]: CardDef | null;
  };
}

const initialState: CardDefState = {
  status: 'UNSET',
  carddefs: {},
};

const cardsSlice = createSlice({
  name: 'carddefs',
  initialState,
  reducers: {
    updateCardDef: (state, action: PayloadAction<CardDef>) => {
      if (action.payload.id != null) {
        state.carddefs[action.payload.id] = action.payload;
      }
    },
    removeCardDef: (state, action: PayloadAction<number>) => {
      delete state.carddefs[action.payload];
    },
  },
  extraReducers: builder =>
    builder
      .addCase(API.initCardDefs.pending, state => {
        state.status = 'LOADING';
      })
      .addCase(API.initCardDefs.fulfilled, (_state, action) => {
        return {
          status: 'READY',
          carddefs: mapById(action.payload),
        };
      })
      .addCase(API.getProjectCardDefs.pending, state => {
        state.status = 'LOADING';
      })
      .addCase(API.getProjectCardDefs.fulfilled, (state, action) => {
        (state.status = 'READY'),
          (state.carddefs = { ...state.carddefs, ...mapById(action.payload) });
      })
      .addCase(API.getCardDef.pending, (state, action) => {
        state.carddefs[action.meta.arg] = null;
      })
      .addCase(API.getCardDef.fulfilled, (state, action) => {
        if (action.payload.id) {
          state.carddefs[action.payload.id] = action.payload;
        }
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export const { updateCardDef, removeCardDef } = cardsSlice.actions;

export default cardsSlice.reducer;
