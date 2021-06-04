/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Document} from 'colab-rest-client';
import * as API from '../API/api';
//import {mapById} from '../helper';

export type Status = 'UNSET' | 'LOADING' | 'READY';

export interface DocumentState {
  // resourcesStatus: Record<number, Status>
  documents: Record<number, Document | null>
}

const initialState: DocumentState = {
  documents: {},
};

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    updateDocument: (state, action: PayloadAction<Document>) => {
      if (action.payload.id != null) {
        state.documents[action.payload.id] = action.payload;
      }
    },
    removeDocument: (state, action: PayloadAction<number>) => {
      delete state.documents[action.payload];
    },
  },
  extraReducers: builder =>
    builder
      .addCase(API.getDocument.pending, (state, action) => {
        state.documents[action.meta.arg] = null;
      })
      .addCase(API.getDocument.fulfilled, (state, action) => {
        if (action.payload.id) {
          state.documents[action.payload.id] = action.payload;
        }
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export const {updateDocument, removeDocument} = documentsSlice.actions;

export default documentsSlice.reducer;
