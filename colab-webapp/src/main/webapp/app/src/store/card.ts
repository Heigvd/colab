/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Card } from 'colab-rest-client';
import * as API from '../API/api';

export interface CardState {
  status: 'UNSET' | 'LOADING' | 'READY';
  cards: {
    [id: number]: Card;
  };
}
const initialState: CardState = {
  status: 'UNSET',
  cards: {},
};

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    updateCard: (state, action: PayloadAction<Card>) => {
      if (action.payload.id != null) {
        state.cards[action.payload.id] = action.payload;
      }
    },
    removeCard: (state, action: PayloadAction<number>) => {
      delete state.cards[action.payload];
    },
  },
  extraReducers: builder =>
    builder
      .addCase(API.initCards.pending, state => {
        state.status = 'LOADING';
      })
      .addCase(API.initCards.fulfilled, (_state, action) => {
        return {
          status: 'READY',
          cards: action.payload.reduce<CardState['cards']>((acc, current) => {
            if (current.id) {
              acc[current.id] = current;
            }
            return acc;
          }, {}),
        };
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      })
});

export const { updateCard, removeCard } = cardsSlice.actions;

export default cardsSlice.reducer;
