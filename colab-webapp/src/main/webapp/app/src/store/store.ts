/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { combineReducers } from 'redux';
import thunk from 'redux-thunk';

import authReducer from './auth';
import adminReducer from './admin';
import cardReducer from './card';
import cardTypeReducer from './cardtype';
import errorReducer from './error';
import projectReducer from './project';
import userReducer from './user';
import websocketReducer from './websocket';
import { configureStore } from '@reduxjs/toolkit';

const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  errors: errorReducer,
  projects: projectReducer,
  cards: cardReducer,
  cardtype: cardTypeReducer,
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
