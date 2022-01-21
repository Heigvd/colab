/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import React, { useEffect, useState } from 'react';
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

/**
 * Allows to use both onClick and onDoubleClick on the same component.
 */
export function useSingleAndDoubleClick(
  actionSimpleClick: (e?: React.MouseEvent) => void,
  actionDoubleClick: (e?: React.MouseEvent) => void,
  stopPropag = true,
  delay = 250,
) {
  const [clickEvent, setClickEvent] = useState<{ nbClick: number; event?: React.MouseEvent }>({
    nbClick: 0,
    event: undefined,
  });

  useEffect(() => {
    if (stopPropag) {
      clickEvent.event?.stopPropagation();
    }
    const timer = setTimeout(() => {
      // simple click
      if (clickEvent.nbClick === 1) actionSimpleClick(clickEvent.event);
      setClickEvent({ nbClick: 0, event: undefined });
    }, delay);
    // the duration between this click and the previous one
    // is less than the value of delay = double-click
    if (clickEvent.nbClick === 2) {
      clearTimeout(timer);
      actionDoubleClick(clickEvent.event);
    }

    return () => clearTimeout(timer);
  }, [clickEvent, actionSimpleClick, actionDoubleClick, stopPropag, delay]);

  return (e: React.MouseEvent) => setClickEvent(prev => ({ nbClick: prev.nbClick + 1, event: e }));
}
