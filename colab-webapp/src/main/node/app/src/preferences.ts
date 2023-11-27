/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

// import {isEqual} from 'lodash';
import * as React from 'react';

// *************************************************************************************************
// local storage

const localStorageKey = 'colab_common';

/**
 * Keep the user preferences in local storage.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const getValue = React.useCallback(() => {
    const value = window.localStorage.getItem(getKey(key));
    return value != null ? (JSON.parse(value) as T) : defaultValue;
  }, [key, defaultValue]);

  const [value, setValue] = React.useState(getValue);

  React.useEffect(() => {
    window.localStorage.setItem(getKey(key), JSON.stringify(value));
  }, [key, value]);

  // uncomment next lines to enable cross-tabs sync:
  //
  //  const onChange = React.useCallback(() => {
  //    const v = getValue();
  //    if (!isEqual(v, value)) {
  //      setValue(v);
  //    }
  //  }, [getValue, value]);

  //  React.useEffect(() => {
  //    const cb = onChange;
  //    window.addEventListener('storage', cb);
  //    return () => {
  //      window.removeEventListener('storage', cb);
  //    };
  //  }, [onChange])

  return [value, setValue];
}

function getKey(key: string) {
  return `${localStorageKey}.${key}`;
}

// *************************************************************************************************
