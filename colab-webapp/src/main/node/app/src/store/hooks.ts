/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import React from 'react';
import { shallowEqual, TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, ColabState } from './store';

export { shallowEqual } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<ColabState> = useSelector;

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
