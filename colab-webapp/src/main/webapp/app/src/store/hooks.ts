/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { ColabState, AppDispatch } from './store';
import { Project, User } from 'colab-rest-client';
import { StateStatus } from './project';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<ColabState> = useSelector;

export const useCurrentUser = (): User | null | undefined => {
  return useAppSelector(state => {
    if (state.auth.currentUserId != null) {
      return state.users.users[state.auth.currentUserId];
    } else {
      return state.auth.currentUserId;
    }
  });
};

export interface UsedProject {
  project: Project | null | undefined;
  status: StateStatus;
}

export const useProject = (id: number): UsedProject => {
  return useAppSelector(state => {
    if (state.projects.projects[id]) {
      // project is known
      return {
        project: state.projects.projects[id],
        status: 'SET',
      };
    } else {
      // project is not knwon
      if (state.projects.status === 'SET') {
        // state is up to date, such project just does not exist
        return {
          project: null,
          status: `SET`,
        };
      } else {
        // this project may or may not exist...
        return {
          project: undefined,
          status: state.projects.status,
        };
      }
    }
  });
};
