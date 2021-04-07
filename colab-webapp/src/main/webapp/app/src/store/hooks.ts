/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {ColabState, AppDispatch} from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<ColabState> = useSelector;


export const useCurrentUser = () => {
  return useAppSelector((state) => {
    if (state.auth.currentUserId) {
      return state.users.users[state.auth.currentUserId];
    }
  });
}
