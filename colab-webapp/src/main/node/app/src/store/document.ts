/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import { Document, entityIs } from 'colab-rest-client';
import * as API from '../API/api';
//import {mapById} from '../helper';
import { processMessage } from '../ws/wsThunkActions';
import { LoadingStatus } from './store';

export interface DocumentState {
  documents: Record<number, Document | LoadingStatus>;
  byCardContent: Record<number, { documentIds: number[]; status: LoadingStatus }>;
  byResource: Record<number, { documentIds: number[]; status: LoadingStatus }>;
}

const initialState: DocumentState = {
  documents: {},
  byCardContent: {},
  byResource: {},
};

const updateDocument = (state: DocumentState, document: Document) => {
  if (document.id != null) {
    state.documents[document.id] = document;

    if (document.owningCardContentId) {
      const cardContentId = document.owningCardContentId;
      const stateForCardContent = state.byCardContent[cardContentId];
      if (stateForCardContent) {
        if (!stateForCardContent.documentIds.includes(document.id)) {
          stateForCardContent.documentIds.push(document.id);
        }
      }
    }

    if (document.owningResourceId) {
      const resourceId = document.owningResourceId;
      const stateForResource = state.byResource[resourceId];
      if (stateForResource) {
        if (!(stateForResource.documentIds.includes(document.id))) {
          stateForResource.documentIds.push(document.id);
        }
      }
    }
  }
};

const removeDocument = (state: DocumentState, documentId: number) => {
  const documentState = state.documents[documentId];

  if (documentState && entityIs(documentState, 'Document')) {
    if (documentState.owningCardContentId) {
      const cardContentId = documentState.owningCardContentId;
      const stateForCardContent = state.byCardContent[cardContentId];
      if (stateForCardContent) {
        const index = stateForCardContent.documentIds.indexOf(documentId);
        if (index >= 0) {
          stateForCardContent.documentIds.splice(index, 1);
        }
      }
    }

    if (documentState.owningResourceId) {
      const resourceId = documentState.owningResourceId;
      const stateForResource = state.byResource[resourceId];
      if (stateForResource) {
        const index = stateForResource.documentIds.indexOf(documentId);
        if (index >= 0) {
          stateForResource.documentIds.splice(index, 1);
        }
      }
    }
  }

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
        updateDocument(state, action.payload);
      })
      .addCase(API.getDeliverablesOfCardContent.pending, (state, action) => {
        const cardContentId = action.meta.arg;
        state.byCardContent[cardContentId] = { documentIds: [], status: 'LOADING' };
      })
      .addCase(API.getDeliverablesOfCardContent.fulfilled, (state, action) => {
        const cardContentId = action.meta.arg;
        state.byCardContent[cardContentId] = {
          documentIds: action.payload.flatMap(doc => (doc.id ? [doc.id] : [])),
          status: 'READY'
        };

        action.payload.forEach(doc => {
          if (doc && doc.id) {
            state.documents[doc.id] = doc;
          }
        })
      })
      .addCase(API.getDocumentsOfResource.pending, (state, action) => {
        const resourceId = action.meta.arg;
        state.byResource[resourceId] = { documentIds: [], status: 'LOADING' };
      })
      .addCase(API.getDocumentsOfResource.fulfilled, (state, action) => {
        const resourceId = action.meta.arg;
        state.byResource[resourceId] = {
          documentIds: action.payload.flatMap(doc => (doc.id ? [doc.id] : [])),
          status: 'READY'
        }

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
