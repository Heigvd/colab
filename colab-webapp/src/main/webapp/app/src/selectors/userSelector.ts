/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { User } from 'colab-rest-client';
import { shallowEqual, useAppSelector } from '../store/hooks';
import { ColabState } from '../store/store';

export const useCurrentUser = (): {
  currentUser: User | null;
  status: ColabState['auth']['status'];
} => {
  return useAppSelector(state => {
    const user =
      state.auth.currentUserId != null ? state.users.users[state.auth.currentUserId] : null;

    return {
      currentUser: user || null,
      status: state.auth.status,
    };
  }, shallowEqual);
};
