/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Block } from 'colab-rest-client';
import * as API from '../API/api';
import { mapById } from '../helper';
//import {mapById} from '../helper';

export type Status = 'UNSET' | 'LOADING' | 'READY';

export interface BlockState {
  /**
   * BlockDocumentId to list of block id
   */
  documents: Record<number, number[] | null>;
  blocks: Record<number, Block | null>;
}

const initialState: BlockState = {
  documents: {},
  blocks: {},
};

const blocksSlice = createSlice({
  name: 'blocks',
  initialState,
  reducers: {
    updateBlock: (state, action: PayloadAction<Block>) => {
      if (action.payload.id != null) {
        state.blocks[action.payload.id] = action.payload;
        if (action.payload.documentId != null) {
          // make sure the document references the block
          const docBlocks = state.documents[action.payload.documentId];
          if (docBlocks != null) {
            if (docBlocks.indexOf(action.payload.id) < 0) {
              docBlocks.push(action.payload.id);
            }
          }
        }
      }
    },
    removeBlock: (state, action: PayloadAction<number>) => {
      const blockId = action.payload;
      const block = state.blocks[blockId];

      if (block != null) {
        if (block.documentId != null) {
          // unregister the block from its document
          const docBlocks = state.documents[block.documentId];
          if (docBlocks != null) {
            const index = docBlocks.indexOf(blockId);
            if (index >= 0) {
              docBlocks.splice(index, 1);
            }
          }
        }
        // drop the block
        delete state.blocks[blockId];
      }
    },
  },
  extraReducers: builder =>
    builder
      .addCase(API.getBlock.pending, (state, action) => {
        state.blocks[action.meta.arg] = null;
      })
      .addCase(API.getBlock.fulfilled, (state, action) => {
        if (action.payload.id) {
          state.blocks[action.payload.id] = action.payload;
        }
      })
      .addCase(API.getDocumentBlocks.pending, (state, action) => {
        if (action.meta.arg.id != null) {
          state.documents[action.meta.arg.id] = null;
        }
      })
      .addCase(API.getDocumentBlocks.fulfilled, (state, action) => {
        const docId = action.meta.arg.id;
        if (docId != null) {
          if (action.payload != null) {
            state.blocks = { ...state.blocks, ...mapById(action.payload) };
            state.documents[docId] = action.payload.flatMap(block => (block.id ? [block.id] : []));
          }
        }
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export const { updateBlock, removeBlock } = blocksSlice.actions;

export default blocksSlice.reducer;
