/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { Account, entityIs, HttpSession, User } from 'colab-rest-client';
import * as API from '../../API/api';
import {
  shallowEqual,
  useAppDispatch,
  useAppSelector,
  useFetchById,
  useLoadDataWithArg,
} from '../hooks';
import { AvailabilityStatus, ColabState } from '../store';
import { selectCurrentProjectId } from './projectSelector';

export const selectCurrentUserId = (state: ColabState) => state.auth.currentUserId;

export function useCurrentUserId(): number | null {
  return useAppSelector(selectCurrentUserId);
}

export const useCurrentUser = (): {
  currentUser: User | null;
  status: ColabState['auth']['status'];
} => {
  return useAppSelector(state => {
    const user =
      state.auth.currentUserId != null ? state.users.users[state.auth.currentUserId] : null;

    return {
      currentUser: entityIs(user, 'User') ? user : null,
      status: state.auth.status,
    };
  }, shallowEqual);
};

export const useCurrentUserAccounts = (): Account[] | 'LOADING' => {
  return useAppSelector(state => {
    const userId = state.auth.currentUserId;

    if (userId != null) {
      return Object.values(state.users.accounts).filter(a => a.userId == userId);
    }

    return 'LOADING';
  }, shallowEqual);
};

export const useUserAccounts = (userId: number | null | undefined): Account[] | 'LOADING' => {
  return useAppSelector(state => {
    if (userId != null) {
      return Object.values(state.users.accounts).filter(a => a.userId == userId);
    }
    return 'LOADING';
  }, shallowEqual);
};

export const useUserHttpSessions = (
  userId: number | null | undefined,
): HttpSession[] | 'LOADING' => {
  const dispatch = useAppDispatch();
  const accounts = useCurrentUserAccounts();

  return useAppSelector(state => {
    if (userId != null) {
      if (accounts != 'LOADING') {
        if (state.users.currentHttpSessionsStatus === 'NOT_INITIALIZED') {
          dispatch(API.getCurrentUserHttpSessions());
        } else if (state.users.currentHttpSessionsStatus === 'READY') {
          const aIds = accounts.map(a => a.id!);
          return Object.values(state.users.httpSessions).filter(session =>
            aIds.includes(session.accountId!),
          );
        }
      }
    }
    return 'LOADING';
  }, shallowEqual);
};

export interface UserAndStatus {
  status: AvailabilityStatus;
  user: User | null;
}

export const selectUsers = (state: ColabState) => state.users.users;

export function useUser(id: number): UserAndStatus {
  const { status, data } = useFetchById<User>(id, selectUsers, API.getUser);
  return { status, user: data || null };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select status
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectStatusForCurrentProject(state: ColabState): AvailabilityStatus {
  return state.users.statusUsersForCurrentProject;
}

export function useLoadUsersForCurrentProject(): AvailabilityStatus {
  const currentProjectId = useAppSelector(selectCurrentProjectId);

  return useLoadDataWithArg(
    selectStatusForCurrentProject,
    API.getUsersForProject,
    currentProjectId,
  );
}
