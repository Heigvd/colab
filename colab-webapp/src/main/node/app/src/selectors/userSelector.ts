/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { Account, entityIs, HttpSession, User } from 'colab-rest-client';
import * as API from '../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../store/hooks';
import { ColabState } from '../store/store';

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

export const useUserSession = (userId: number | null | undefined): HttpSession[] | 'LOADING' => {
  const dispatch = useAppDispatch();
  const accounts = useCurrentUserAccounts();

  return useAppSelector(state => {
    if (userId != null) {
      if (accounts != 'LOADING') {
        if (state.users.currentUserSessionState === 'NOT_INITIALIZED') {
          dispatch(API.getCurrentUserActiveSessions());
        } else if (state.users.currentUserSessionState === 'READY') {
          const aIds = accounts.map(a => a.id!);
          return Object.values(state.users.sessions).filter(session =>
            aIds.includes(session.accountId!),
          );
        }
      }
    }
    return 'LOADING';
  }, shallowEqual);
};
