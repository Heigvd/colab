/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useAppSelector } from '../store/hooks';
import { ChangeState, getObjectState } from '../store/slice/changeSlice';

export const changesEquals = (s1: ChangeState['@'][0], s2: ChangeState['@'][0]): boolean => {
  if (s1.status !== s2.status) {
    return false;
  }

  const ch1 = s1.changes;
  const ch2 = s2.changes;

  if (ch1.length !== ch2.length) {
    return false;
  }

  for (const i in ch1) {
    if (ch1[i]?.revision !== ch2[i]?.revision) {
      return false;
    }
  }
  return true;
};

export const useChanges = (atClass: string, id: number): ChangeState['atClass'][0] => {
  return useAppSelector(state => {
    const oState = getObjectState(state.change, atClass, id);
    if (oState != null) {
      return oState;
    } else {
      return {
        status: 'UNSET',
        changes: [],
      };
    }
  }, changesEquals);
};
