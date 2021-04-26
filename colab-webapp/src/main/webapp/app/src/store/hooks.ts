/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {ColabState, AppDispatch} from './store';
import {Project, User} from 'colab-rest-client';
import {StateStatus} from './project';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<ColabState> = useSelector;

export const useCurrentUser = (): {
  currentUser: User | null;
  status: ColabState['auth']['status']
} => {
  return useAppSelector(state => {
    const user = (state.auth.currentUserId != null ? state.users.users[state.auth.currentUserId] : null);

    return {
      currentUser: user,
      status: state.auth.status
    };
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
        status: 'INITIALIZED',
      };
    } else {
      // project is not knwon
      if (state.projects.status === 'INITIALIZED') {
        // state is up to date, such project just does not exist
        return {
          project: null,
          status: `INITIALIZED`,
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

export const useProjectBeingEdited = (): {
  project: Project | null;
  status: 'NOT_EDITING' | 'LOADING' | 'READY';
} => {
  return useAppSelector(state => {
    if (state.projects.editing != null) {
      return {
        project: state.projects.projects[state.projects.editing],
        status: state.projects.editingStatus,
      };
    } else {
      return {
        project: null,
        status: state.projects.editingStatus,
      };
    }
  });
};
