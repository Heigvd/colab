/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createSlice } from '@reduxjs/toolkit';
import { AbstractCardType } from 'colab-rest-client';
import * as API from '../../API/api';
import { mapById } from '../../helper';
import { processMessage } from '../../ws/wsThunkActions';
import { AvailabilityStatus } from '../store';

/** what we have in the store */
export interface CardTypeState {
  /** all the card types we got so far */
  cardtypes: Record<number, AbstractCardType | AvailabilityStatus>;

  // are all types used by the current project known or not ?
  //  -> card types defined by the project
  //   + defined by other projects and already referenced by the current project
  //     (CardTypeRef chain + CardType)
  currentProjectStatus: AvailabilityStatus;

  // are all types visible by the current user known ?
  //  -> published type from other projects + global published
  availablePublishedStatus: AvailabilityStatus;

  // are all global types known (admin ony) ?
  allGlobalForAdminStatus: AvailabilityStatus;
}

const initialState: CardTypeState = {
  cardtypes: {},

  currentProjectStatus: 'NOT_INITIALIZED',
  availablePublishedStatus: 'NOT_INITIALIZED',
  allGlobalForAdminStatus: 'NOT_INITIALIZED',
};

/** what to do when a card type was updated / created */
function updateCardType(state: CardTypeState, cardType: AbstractCardType) {
  if (cardType.id != null) {
    state.cardtypes[cardType.id] = cardType;
  }
}

/** what to do when a card type was deleted */
function removeCardType(state: CardTypeState, cardTypeId: number) {
  delete state.cardtypes[cardTypeId];
}

const cardTypeSlice = createSlice({
  name: 'cardTypes',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.cardTypes.updated.forEach(cardType => updateCardType(state, cardType));
        action.payload.cardTypes.deleted.forEach(entry => removeCardType(state, entry.id));
      })
      .addCase(API.getExpandedCardType.pending, (state, action) => {
        state.cardtypes[action.meta.arg] = 'LOADING';
      })
      .addCase(API.getExpandedCardType.fulfilled, (state, action) => {
        state.cardtypes = { ...state.cardtypes, ...mapById(action.payload) };
      })
      .addCase(API.getExpandedCardType.rejected, (state, action) => {
        state.cardtypes[action.meta.arg] = 'ERROR';
      })
      .addCase(API.getProjectCardTypes.pending, state => {
        state.currentProjectStatus = 'LOADING';
      })
      .addCase(API.getProjectCardTypes.fulfilled, (state, action) => {
        state.cardtypes = { ...state.cardtypes, ...mapById(action.payload) };
        state.currentProjectStatus = 'READY';
      })
      .addCase(API.getProjectCardTypes.rejected, state => {
        state.currentProjectStatus = 'ERROR';
      })
      .addCase(API.getAvailablePublishedCardTypes.pending, state => {
        state.availablePublishedStatus = 'LOADING';
      })
      .addCase(API.getAvailablePublishedCardTypes.fulfilled, (state, action) => {
        state.cardtypes = { ...state.cardtypes, ...mapById(action.payload) };
        state.availablePublishedStatus = 'READY';
      })
      .addCase(API.getAvailablePublishedCardTypes.rejected, state => {
        state.availablePublishedStatus = 'ERROR';
      })
      .addCase(API.getAllGlobalCardTypes.pending, state => {
        state.allGlobalForAdminStatus = 'LOADING';
      })
      .addCase(API.getAllGlobalCardTypes.fulfilled, (state, action) => {
        state.cardtypes = { ...state.cardtypes, ...mapById(action.payload) };
        state.allGlobalForAdminStatus = 'READY';
      })
      .addCase(API.getAllGlobalCardTypes.rejected, state => {
        state.allGlobalForAdminStatus = 'ERROR';
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default cardTypeSlice.reducer;
