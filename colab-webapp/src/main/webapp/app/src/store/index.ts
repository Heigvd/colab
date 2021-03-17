/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createStore, applyMiddleware, Action, AnyAction, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import authReducer from './auth';
import errorReducer from './error';
import projectReducer from './project';
import navigationReducer from './navigation';
import websocketReducer from './websocket';

const rootReducer = combineReducers({
  auth: authReducer,
  errors: errorReducer,
  navigation: navigationReducer,
  projects: projectReducer,
  websockets: websocketReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export const getStore = () => store;

export const dispatch = store.dispatch;

export type ColabState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  ColabState,
  unknown,
  Action<string>
>;

export type TDispatch = ThunkDispatch<ColabState, void, AnyAction>;
