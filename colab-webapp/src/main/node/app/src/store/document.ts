/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import { Document } from 'colab-rest-client';
import * as API from '../API/api';
import { processMessage } from '../ws/wsThunkActions';
import { LoadingStatus } from './store';
//import {mapById} from '../helper';

export type Status = 'UNSET' | 'LOADING' | 'READY';

export interface DocumentState {
  // resourcesStatus: Record<number, Status>
  documents: Record<number, Document | LoadingStatus>;
}

const initialState: DocumentState = {
  documents: {},
};

const updateDocument = (state: DocumentState, document: Document) => {
  if (document.id != null) {
    state.documents[document.id] = document;
  }
};
const removeDocument = (state: DocumentState, documentId: number) => {
  delete state.documents[documentId];
};

const documentsSlice = createSlice({
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
        if (action.payload.id) {
          state.documents[action.payload.id] = action.payload;
        }
      })
      .addCase(API.getDeliverablesOfCardContent.fulfilled, (state, action) => {
        action.payload.forEach(doc => {
          if (doc && doc.id) {
            state.documents[doc.id] = doc;
          }
        })
      })
      .addCase(API.getDocumentsOfResource.fulfilled, (state, action) => {
        action.payload.forEach(doc => {
          if (doc && doc.id) {
            state.documents[doc.id] = doc;
          }
        })
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default documentsSlice.reducer;
