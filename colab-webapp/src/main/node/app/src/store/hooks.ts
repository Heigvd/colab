/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { AsyncThunk } from '@reduxjs/toolkit';
import { ColabEntity } from 'colab-rest-client';
import * as React from 'react';
import { shallowEqual, TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AvailabilityStatus, FetchingStatus } from '../store/store';
import { AppDispatch, ColabState } from './store';

export { shallowEqual } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<ColabState> = useSelector;

interface DataAndStatus<T> {
  status: AvailabilityStatus;
  data?: T;
}

function selectData<T extends ColabEntity>(
  state: ColabState,
  id: number,
  selector: (state: ColabState) => Record<number, T | FetchingStatus>,
): DataAndStatus<T> {
  const dataInStore = selector(state)[id];

  if (dataInStore == null) {
    return { status: 'NOT_INITIALIZED' };
  } else if (typeof dataInStore === 'string') {
    return { status: dataInStore };
  }

  return { status: 'READY', data: dataInStore };
}

export function useFetchById<T extends ColabEntity>(
  id: number,
  selector: (state: ColabState) => Record<number, T | FetchingStatus>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  fetcher: AsyncThunk<T | null, number, {}>,
): DataAndStatus<T> {
  const dispatch = useAppDispatch();

  const { status, data }: DataAndStatus<T> = useAppSelector(
    state => selectData<T>(state, id, selector),
    shallowEqual,
  );

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED' && id > 0) {
      dispatch(fetcher(id));
    }
  }, [status, dispatch, fetcher, id]);

  if (status === 'NOT_INITIALIZED' && id <= 0) {
    return { status: 'ERROR' };
  }

  if (status === 'READY' && data != null) {
    return { status, data };
  }

  return { status };
}

export function useFetchList<T extends ColabEntity>(
  statusSelector: (state: ColabState) => AvailabilityStatus,
  dataSelector: (state: ColabState) => T[],
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  fetcher: AsyncThunk<any, void, {}>,
): { status: AvailabilityStatus; data?: T[] } {
  const dispatch = useAppDispatch();

  const status = useAppSelector(statusSelector);

  const data = useAppSelector(dataSelector, shallowEqual);

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED') {
      dispatch(fetcher());
    }
  }, [status, dispatch, fetcher]);

  if (status === 'READY' && data != null) {
    return { status, data };
  }

  return { status };
}

// TODO Ideally make only one function for useFetchList and useFetchListWithArg

export function useFetchListWithArg<T extends ColabEntity, U>(
  statusSelector: (state: ColabState) => AvailabilityStatus,
  dataSelector: (state: ColabState) => T[],
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  fetcher: AsyncThunk<any, U, {}>,
  fetcherArg: U,
): { status: AvailabilityStatus; data?: T[] } {
  const dispatch = useAppDispatch();

  const status = useAppSelector(statusSelector);

  const data = useAppSelector(dataSelector, shallowEqual);

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED' && fetcherArg) {
      dispatch(fetcher(fetcherArg));
    }
  }, [status, dispatch, fetcher, fetcherArg]);

  if (status === 'NOT_INITIALIZED' && !fetcherArg) {
    return { status: 'ERROR' };
  }

  if (status === 'READY' && data != null) {
    return { status, data };
  }

  return { status };
}

export function useLoadDataWithArg<U>(
  statusSelector: (state: ColabState) => AvailabilityStatus,
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  fetcher: AsyncThunk<any, U, {}>,
  fetcherArg: U,
): AvailabilityStatus {
  const dispatch = useAppDispatch();

  const status = useAppSelector(statusSelector);

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED' && fetcherArg) {
      dispatch(fetcher(fetcherArg));
    }
  }, [status, dispatch, fetcher, fetcherArg]);

  if (status === 'NOT_INITIALIZED' && !fetcherArg) {
    return 'ERROR';
  }

  return status;
}

const hasOwn = Object.prototype.hasOwnProperty;

/**
 * kind of shallowEquals, but use shallowEqual to compare first-level-nested arrays
 */
export const customColabStateEquals = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) {
    return true;
  }

  if (typeof a === 'object' && a != null && typeof b === 'object' && b != null) {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();

    if (aKeys.length !== bKeys.length) {
      // keysets mismatch
      return false;
    }

    for (const key in a) {
      if (hasOwn.call(b, key)) {
        if (key in a) {
          const aValue = (a as { [key: string]: unknown })[key];
          const bValue = (b as { [key: string]: unknown })[key];

          if (!Object.is(aValue, bValue)) {
            // values mismatch
            if (Array.isArray(aValue) && Array.isArray(bValue)) {
              // but values are arrays so they may match anyway
              if (!shallowEqual(aValue, bValue)) {
                // nope, array does not match
                return false;
              }
            } else {
              // not arrays => no match
              return false;
            }
          }
        }
      } else {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};

export const useLoadingState = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  function startLoading() {
    setIsLoading(true);
  }
  function stopLoading() {
    setIsLoading(false);
  }
  return { isLoading, startLoading, stopLoading };
};
