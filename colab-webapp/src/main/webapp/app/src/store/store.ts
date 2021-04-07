/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { combineReducers } from 'redux';
import thunk from 'redux-thunk';

import authReducer from './auth';
import cardReducer from './card';
import errorReducer from './error';
import projectReducer from './project';
import navigationReducer from './navigation';
import userReducer from './user';
import websocketReducer from './websocket';
import { configureStore } from '@reduxjs/toolkit';

const rootReducer = combineReducers({
  auth: authReducer,
  errors: errorReducer,
  navigation: navigationReducer,
  projects: projectReducer,
  cards: cardReducer, // TODO remove ! non sense
  users: userReducer,
  websockets: websocketReducer,
});

//const storeX = createStore(rootReducer, applyMiddleware(thunk));
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(thunk),
});

export const getStore = () => store;

export const dispatch = store.dispatch;

export type ColabState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
