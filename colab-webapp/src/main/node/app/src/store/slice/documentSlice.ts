/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createSlice } from '@reduxjs/toolkit';
import { Document } from 'colab-rest-client';
import * as API from '../../API/api';
import { mapById } from '../../helper';
import { processMessage } from '../../ws/wsThunkActions';
import { AvailabilityStatus } from '../store';

/** what we have in the store */
export interface DocumentState {
  /** all the documents we got so far */
  documents: Record<number, Document | AvailabilityStatus>;

  /** did we load the documents for a card content */
  statusByCardContent: Record<number, AvailabilityStatus>;
  /** did we load the documents for a resource */
  statusByResource: Record<number, AvailabilityStatus>;
}

const initialState: DocumentState = {
  documents: {},

  statusByCardContent: {},
  statusByResource: {},
};

/** what to do when a document is updated or created */
const updateDocument = (state: DocumentState, document: Document) => {
  if (document.id != null) {
    state.documents[document.id] = document;
  }
};

/** what to do when a document is deleted */
const removeDocument = (state: DocumentState, documentId: number) => {
  delete state.documents[documentId];
};

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.documents.updated.forEach(document => updateDocument(state, document));
        action.payload.documents.deleted.forEach(entry => removeDocument(state, entry.id));
      })
      .addCase(API.getDocument.pending, (state, action) => {
        state.documents[action.meta.arg] = 'LOADING';
      })
      .addCase(API.getDocument.fulfilled, (state, action) => {
        if (action.payload?.id != null) {
          updateDocument(state, action.payload);
        } else {
          state.documents[action.meta.arg] = 'ERROR';
        }
      })
      .addCase(API.getDocument.rejected, (state, action) => {
        state.documents[action.meta.arg] = 'ERROR';
      })
      .addCase(API.getDeliverablesOfCardContent.pending, (state, action) => {
        state.statusByCardContent[action.meta.arg] = 'LOADING';
      })
      .addCase(API.getDeliverablesOfCardContent.fulfilled, (state, action) => {
        state.documents = { ...state.documents, ...mapById(action.payload) };
        state.statusByCardContent[action.meta.arg] = 'READY';
      })
      .addCase(API.getDeliverablesOfCardContent.rejected, (state, action) => {
        state.statusByCardContent[action.meta.arg] = 'ERROR';
      })
      .addCase(API.getDocumentsOfResource.pending, (state, action) => {
        state.statusByResource[action.meta.arg] = 'LOADING';
      })
      .addCase(API.getDocumentsOfResource.fulfilled, (state, action) => {
        state.documents = { ...state.documents, ...mapById(action.payload) };
        state.statusByResource[action.meta.arg] = 'READY';
      })
      .addCase(API.getDocumentsOfResource.rejected, (state, action) => {
        state.statusByResource[action.meta.arg] = 'ERROR';
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default documentSlice.reducer;
