/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AbstractCardType, CardType, CardTypeRef } from 'colab-rest-client';
import * as API from '../API/api';
import { mapById } from '../helper';

export interface CardTypeState {
  status: 'UNSET' | 'LOADING' | 'READY';
  cardtypes: {
    [id: number]: AbstractCardType | null;
  };
}

const initialState: CardTypeState = {
  status: 'UNSET',
  cardtypes: {},
};

const cardsSlice = createSlice({
  name: 'cardtypes',
  initialState,
  reducers: {
    updateCardType: (state, action: PayloadAction<CardType>) => {
      if (action.payload.id != null) {
        state.cardtypes[action.payload.id] = action.payload;
      }
    },
    removeCardType: (state, action: PayloadAction<number>) => {
      delete state.cardtypes[action.payload];
    },
    updateCardTypeRef: (_state, _action: PayloadAction<CardTypeRef>) => {
      // TODO
    },
    removeCardTypeRef: (_state, _action: PayloadAction<number>) => {
      // TODO
    },
  },
  extraReducers: builder =>
    builder
      .addCase(API.initCardTypes.pending, state => {
        state.status = 'LOADING';
      })
      .addCase(API.initCardTypes.fulfilled, (_state, action) => {
        return {
          status: 'READY',
          cardtypes: mapById(action.payload),
        };
      })
      .addCase(API.getProjectCardTypes.pending, state => {
        state.status = 'LOADING';
      })
      .addCase(API.getProjectCardTypes.fulfilled, (state, action) => {
        (state.status = 'READY'),
          (state.cardtypes = { ...state.cardtypes, ...mapById(action.payload) });
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

export const {
  updateCardType,
  removeCardType,
  updateCardTypeRef,
  removeCardTypeRef,
} = cardsSlice.actions;

export default cardsSlice.reducer;
