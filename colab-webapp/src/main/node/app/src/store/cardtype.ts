/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import { AbstractCardType } from 'colab-rest-client';
import * as API from '../API/api';
import { mapById } from '../helper';
import { processMessage } from '../ws/wsThunkActions';

export interface CardTypeState {
  // are all types used by the current project known or not ?
  //  -> card types defined by the project
  //   + defined by other projects and already referenced by the current project
  //     (CardTypeRef chain + CardType)
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

const updateCardType = (state: CardTypeState, cardType: AbstractCardType) => {
  if (cardType.id != null) {
    state.cardtypes[cardType.id] = cardType;
  }
};

const removeCardType = (state: CardTypeState, cardTypeId: number) => {
  delete state.cardtypes[cardTypeId];
};

const cardsSlice = createSlice({
  name: 'cardtypes',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.types.updated.forEach(cardType => updateCardType(state, cardType));
        action.payload.types.deleted.forEach(cardType => removeCardType(state, cardType.id));
      })
      .addCase(API.getProjectCardTypes.pending, state => {
        state.currentProjectStatus = 'LOADING';
      })
      .addCase(API.getProjectCardTypes.fulfilled, (state, action) => {
        state.currentProjectStatus = 'READY';
        state.cardtypes = { ...state.cardtypes, ...mapById(action.payload) };
      })
      .addCase(API.getAvailablePublishedCardTypes.pending, state => {
        state.publishedStatus = 'LOADING';
      })
      .addCase(API.getAvailablePublishedCardTypes.fulfilled, (state, action) => {
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

export default cardsSlice.reducer;
