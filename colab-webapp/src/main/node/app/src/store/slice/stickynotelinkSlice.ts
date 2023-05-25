/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createSlice } from '@reduxjs/toolkit';
import { StickyNoteLink } from 'colab-rest-client';
import * as API from '../../API/api';
import { processMessage } from '../../ws/wsThunkActions';
import { LoadingStatus } from '../store';

export interface StickyNoteLinkState {
  stickyNotes: Record<number, StickyNoteLink>;
  byCardDest: Record<number, { stickyNoteIds: number[]; status: LoadingStatus }>;
}

const initialState: StickyNoteLinkState = {
  stickyNotes: {},
  byCardDest: {},
};

// To handle when possible : destination change
const updateStickyNote = (state: StickyNoteLinkState, stickyNote: StickyNoteLink) => {
  if (stickyNote.id != null) {
    if (stickyNote.destinationCardId) {
      const stateForDestCard = state.byCardDest[stickyNote.destinationCardId];
      if (stateForDestCard) {
        // new sticky note handling
        if (!stateForDestCard.stickyNoteIds.includes(stickyNote.id)) {
          stateForDestCard.stickyNoteIds.push(stickyNote.id);
        }
      }
    }

    state.stickyNotes[stickyNote.id] = stickyNote;
  }
};

const removeStickyNote = (state: StickyNoteLinkState, stickyNoteId: number) => {
  const stickyNoteState = state.stickyNotes[stickyNoteId];

  if (stickyNoteState && stickyNoteState.destinationCardId) {
    const stateForDestCard = state.byCardDest[stickyNoteState.destinationCardId];
    if (stateForDestCard) {
      const index = stateForDestCard.stickyNoteIds.indexOf(stickyNoteId);
      if (index >= 0) {
        stateForDestCard.stickyNoteIds.splice(index, 1);
      }
    }
  }

  delete state.stickyNotes[stickyNoteId];
};

const stickyNoteLinksSlice = createSlice({
  name: 'stickynotelinks',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.stickynotelinks.upserted.forEach(sn => updateStickyNote(state, sn));
        action.payload.stickynotelinks.deleted.forEach(indexEntry =>
          removeStickyNote(state, indexEntry.id),
        );
      })
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
            state.stickyNotes[stickyNote.id] = stickyNote;
          }
        });
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.closeCurrentSession.fulfilled, () => {
        return initialState;
      }),
});

export default stickyNoteLinksSlice.reducer;
