/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import { Block } from 'colab-rest-client';
import * as API from '../API/api';
import { processMessage } from '../ws/wsThunkActions';
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

const updateBlock = (state: BlockState, block: Block) => {
  if (block.id != null) {
    state.blocks[block.id] = block;
    if (block.documentId != null) {
      // make sure the document references the block
      const docBlocks = state.documents[block.documentId];
      if (docBlocks != null) {
        if (docBlocks.indexOf(block.id) < 0) {
          docBlocks.push(block.id);
        }
      }
    }
  }
};

const removeBlock = (state: BlockState, blockId: number) => {
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
};

const blocksSlice = createSlice({
  name: 'blocks',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.blocks.updated.forEach(block => updateBlock(state, block));
        action.payload.blocks.deleted.forEach(entry => removeBlock(state, entry.id));
      })
      .addCase(API.getBlock.pending, (state, action) => {
        state.blocks[action.meta.arg] = null;
      })
      .addCase(API.getBlock.fulfilled, (state, action) => {
        updateBlock(state, action.payload);
      })
      .addCase(API.createBlock.fulfilled, (state, action) => {
        const docId = action.meta.arg.document.id!;
        const blockId = action.payload;
        const docState = state.documents[docId];
        if (docState) {
          docState.push(blockId);
        }
      })
      .addCase(API.getDocumentBlocksIds.pending, (state, action) => {
        if (action.meta.arg.id != null) {
          state.documents[action.meta.arg.id] = null;
        }
      })
      .addCase(API.getDocumentBlocksIds.fulfilled, (state, action) => {
        const docId = action.meta.arg.id;
        if (docId != null) {
          if (action.payload != null) {
            //state.blocks = { ...state.blocks, ...mapById(action.payload) };
            state.documents[docId] = action.payload;
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

export default blocksSlice.reducer;
