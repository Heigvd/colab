/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HttpException } from 'colab-rest-client';
//import * as API from '../API/api';

export interface ColabError {
  status: 'OPEN' | 'CLOSED';
  error: HttpException | Error;
}

const initialState: ColabError[] = [];

const errorsSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    addError: (state, action: PayloadAction<ColabError>) => {
      state.push(action.payload);
    },
    closeError: (state, action: PayloadAction<number>) => {
      state[action.payload].status = 'CLOSED';
    },
  },
//  extraReducers: builder =>
//    builder
//      .addCase(API.signOut.fulfilled, () => {
//        return initialState;
//      })
});

export const { addError, closeError } = errorsSlice.actions;

export default errorsSlice.reducer;
