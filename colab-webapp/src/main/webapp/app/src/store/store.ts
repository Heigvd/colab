/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import thunk from 'redux-thunk';
import adminReducer from './admin';
import authReducer from './auth';
import blockReducer from './block';
import cardReducer from './card';
import cardTypeReducer from './cardtype';
import changeReducer from './change';
import documentReducer from './document';
import errorReducer from './error';
import projectReducer from './project';
import resourceReducer from './resource';
import stickyNoteLinkReducer from './stickynotelink';
import userReducer from './user';
import websocketReducer from './websocket';

const rootReducer = combineReducers({
  admin: adminReducer,
  auth: authReducer,
  block: blockReducer,
  cards: cardReducer,
  cardtype: cardTypeReducer,
  change: changeReducer,
  document: documentReducer,
  errors: errorReducer,
  projects: projectReducer,
  resources: resourceReducer,
  stickynotelinks: stickyNoteLinkReducer,
  users: userReducer,
  websockets: websocketReducer,
});

//const storeX = createStore(rootReducer, applyMiddleware(thunk));
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(thunk),
});

export const getStore = (): typeof store => store;

export const dispatch = store.dispatch;

export type ColabState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type LoadingStatus = 'NOT_INITIALIZED' | 'LOADING' | 'READY';
