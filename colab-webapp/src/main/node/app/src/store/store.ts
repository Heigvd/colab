/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import activityFlowLinkReducer from './slice/activityflowlinkSlice';
import adminReducer from './slice/adminSlice';
import assignmentReducer from './slice/assignmentSlice';
import authReducer from './slice/authSlice';
import cardReducer from './slice/cardSlice';
import cardTypeReducer from './slice/cardTypeSlice';
import changeReducer from './slice/changeSlice';
import configReducer from './slice/configurationSlice';
import documentReducer from './slice/documentSlice';
import externalDataReducer from './slice/externalDataSlice';
import notifReducer from './slice/notificationSlice';
import instanceMakerReducer from './slice/instanceMakerSlice';
import presenceReducer from './slice/presenceSlice';
import projectReducer from './slice/projectSlice';
import resourceReducer from './slice/resourceSlice';
import securityReducer from './slice/securitySlice';
import stickyNoteLinkReducer from './slice/stickynotelinkSlice';
import teamMemberReducer from './slice/teamMemberSlice';
import teamRoleReducer from './slice/teamRoleSlice';
import teamReducer from './slice/teamSlice';
import userReducer from './slice/userSlice';
import websocketReducer from './slice/websocketSlice';

const rootReducer = combineReducers({
  assignments: assignmentReducer,
  activityFlowLinks: activityFlowLinkReducer,
  auth: authReducer,
  admin: adminReducer,
  cards: cardReducer,
  cardType: cardTypeReducer,
  config: configReducer,
  change: changeReducer,
  document: documentReducer,
  externalData: externalDataReducer,
  instanceMakers: instanceMakerReducer,
  notifications: notifReducer,
  presences: presenceReducer,
  project: projectReducer,
  resources: resourceReducer,
  security: securityReducer,
  stickynotelinks: stickyNoteLinkReducer,
  teamMembers: teamMemberReducer,
  teamRoles: teamRoleReducer,
  team: teamReducer,
  users: userReducer,
  websockets: websocketReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export const storeDispatch = store.dispatch;

export type ColabState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type LoadingStatus = 'NOT_INITIALIZED' | 'LOADING' | 'READY';

export type FetchingStatus = 'LOADING' | 'ERROR';

export type AvailabilityStatus = 'NOT_INITIALIZED' | 'LOADING' | 'ERROR' | 'READY';

export type InlineAvailabilityStatus<T> = 'NOT_INITIALIZED' | 'LOADING' | 'ERROR' | T;

export type EditionStatus = 'NOT_EDITING' | 'LOADING' | 'READY';
