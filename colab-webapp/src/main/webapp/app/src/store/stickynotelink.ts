/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createSlice } from '@reduxjs/toolkit';
import { StickyNoteLink } from 'colab-rest-client';
import * as API from '../API/api';
import { loadingStatus } from './store';

export interface StickyNoteLinkState {
  stickyNotes: Record<number, { stickyNote: StickyNoteLink }>;
  byCardDest: Record<number, { stickyNoteIds: number[]; status: loadingStatus }>;
}

const initialState: StickyNoteLinkState = {
  stickyNotes: {},
  byCardDest: {},
};

// TODO handle every change

//const updateLink = (state: StickyNoteLinkState, link: StickyNoteLink) => {
//  if (link.id != null) {
//    state.stickyNotes[link.id] = { link };
//  }
//};

// TODO handle everything
//const removeLink = (state: StickyNoteLinkState, linkId: number) => {
//  delete state.stickyNotes[linkId];
//};

const stickyNoteLinksSlice = createSlice({
  name: 'stickynotelinks',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      //.addCase(processMessage.fulfilled, (state, action) => {
      //  action.payload.stickynotelinks.updated.forEach(link => updateLink(state, link));
      //  action.payload.stickynotelinks.deleted.forEach(entry => removeLink(state, entry.id));
      //})
      //.addCase(API.getStickyNoteLink.pending, (state, action) => {
      //  state.links[action.meta.arg] = null;
      //})
      //.addCase(API.getStickyNoteLink.fulfilled, (state, action) => {
      //  if (action.payload.id) {
      //    state.links[action.payload.id] = action.payload;
      //  }
      //})
      .addCase(API.getStickyNoteLinkAsDest.pending, (state, action) => {
        state.byCardDest[action.meta.arg] = { stickyNoteIds: [], status: 'LOADING' };
      })
      .addCase(API.getStickyNoteLinkAsDest.fulfilled, (state, action) => {
        state.byCardDest[action.meta.arg] = {
          stickyNoteIds: action.payload.flatMap(sn => (sn.id ? [sn.id] : [])),
          status: 'READY',
        };

        action.payload.forEach(stickyNote => {
          if (stickyNote && stickyNote.id) {
            state.stickyNotes[stickyNote.id] = { stickyNote };
          }
        });
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default stickyNoteLinksSlice.reducer;
