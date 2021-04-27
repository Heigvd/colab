/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Card, CardContent} from 'colab-rest-client';
import * as API from '../API/api';
import {mapById} from '../helper';

export interface CardState {
  status: 'UNSET' | 'LOADING' | 'READY';
  cards: {
    [id: number]: {
      card: Card | null
      contents?: {
        [id: number]: CardContent | null
      } | null
    }
  }
};
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
        if (state.cards[action.payload.id]) {
          state.cards[action.payload.id].card = action.payload;
        }
      }
    },
    removeCard: (state, action: PayloadAction<number>) => {
      delete state.cards[action.payload];
    },
    updateContent: (state, action: PayloadAction<CardContent>) => {
      if (action.payload.id != null && action.payload.cardId != null) {
        const cardState = state.cards[action.payload.cardId];
        if (cardState != null) {
          if (cardState.contents != null){
            cardState.contents[action.payload.id] = action.payload;
          }
        }
      }
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
              acc[current.id] = {card: current};
            }
            return acc;
          }, {}),
        };
      })
      .addCase(API.getCard.pending, (state, action) => {
        state.cards[action.meta.arg] = state.cards[action.meta.arg] || {};
        state.cards[action.meta.arg].card = null;
      })
      .addCase(API.getCard.fulfilled, (state, action) => {
        if (action.payload.id) {
          state.cards[action.payload.id].card = action.payload;
        }
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.getCardContents.pending, (state, action) => {
        // set contents to null means loading
        state.cards[action.meta.arg].contents = null;
      })
      .addCase(API.getCardContents.fulfilled, (state, action) => {
        state.cards[action.meta.arg].contents = mapById(action.payload)
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export const {updateCard, removeCard} = cardsSlice.actions;

export default cardsSlice.reducer;
