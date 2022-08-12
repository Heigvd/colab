/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Document } from 'colab-rest-client';
import * as API from '../API/api';
import { DocumentOwnership } from '../components/documents/documentCommonType';
import { mapById } from '../helper';
import { processMessage } from '../ws/wsThunkActions';
import { AvailabilityStatus } from './store';

/** what we have in the store */
interface DocumentState {
  /** all the documents we got so far */
  documents: Record<number, Document | AvailabilityStatus>;

  /** did we load the documents for a card content */
  statusByCardContent: Record<number, AvailabilityStatus>;
  /** did we load the documents for a resource */
  statusByResource: Record<number, AvailabilityStatus>;

  // Note : not sure if it is useful to have one for card content and one for resource

  /** the very last inserted document by card content. allow to open it in edition mode */
  lastInsertedByCardContent: Record<number, Document['id'] | null>;
  /** the very last inserted document by resource. allow to open it in edition mode */
  lastInsertedByResource: Record<number, Document['id'] | null>;
}

const initialState: DocumentState = {
  documents: {},

  statusByCardContent: {},
  statusByResource: {},

  lastInsertedByCardContent: {},
  lastInsertedByResource: {},
};

/** what to do when a document was updated / created */
const updateDocument = (state: DocumentState, document: Document) => {
  if (document.id != null) {
    state.documents[document.id] = document;
  }
};

/** what to do when a document was deleted */
const removeDocument = (state: DocumentState, documentId: number) => {
  delete state.documents[documentId];
};

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    resetLastInsertedDocId: (state, action: PayloadAction<{ docOwnership: DocumentOwnership }>) => {
      if (action.payload.docOwnership.kind === 'DeliverableOfCardContent') {
        delete state.lastInsertedByCardContent[action.payload.docOwnership.ownerId];
      } else if (action.payload.docOwnership.kind === 'PartOfResource') {
        delete state.lastInsertedByResource[action.payload.docOwnership.ownerId];
      }
    },
  },
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
      .addCase(API.addDeliverableAtBeginning.fulfilled, (state, action) => {
        if (action.meta.arg.cardContentId && action.payload.id) {
          state.lastInsertedByCardContent[action.meta.arg.cardContentId] = action.payload.id;
        }
      })
      .addCase(API.addDeliverableAtEnd.fulfilled, (state, action) => {
        if (action.meta.arg.cardContentId && action.payload.id) {
          state.lastInsertedByCardContent[action.meta.arg.cardContentId] = action.payload.id;
        }
      })
      .addCase(API.addDeliverableBefore.fulfilled, (state, action) => {
        if (action.meta.arg.cardContentId && action.payload.id) {
          state.lastInsertedByCardContent[action.meta.arg.cardContentId] = action.payload.id;
        }
      })
      .addCase(API.addDeliverableAfter.fulfilled, (state, action) => {
        if (action.meta.arg.cardContentId && action.payload.id) {
          state.lastInsertedByCardContent[action.meta.arg.cardContentId] = action.payload.id;
        }
      })
      .addCase(API.addDocumentToResourceAtBeginning.fulfilled, (state, action) => {
        if (action.meta.arg.resourceId && action.payload.id) {
          state.lastInsertedByResource[action.meta.arg.resourceId] = action.payload.id;
        }
      })
      .addCase(API.addDocumentToResourceAtEnd.fulfilled, (state, action) => {
        if (action.meta.arg.resourceId && action.payload.id) {
          state.lastInsertedByResource[action.meta.arg.resourceId] = action.payload.id;
        }
      })
      .addCase(API.addDocumentToResourceBefore.fulfilled, (state, action) => {
        if (action.meta.arg.resourceId && action.payload.id) {
          state.lastInsertedByResource[action.meta.arg.resourceId] = action.payload.id;
        }
      })
      .addCase(API.addDocumentToResourceAfter.fulfilled, (state, action) => {
        if (action.meta.arg.resourceId && action.payload.id) {
          state.lastInsertedByResource[action.meta.arg.resourceId] = action.payload.id;
        }
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export const { resetLastInsertedDocId } = documentSlice.actions;

export default documentSlice.reducer;
