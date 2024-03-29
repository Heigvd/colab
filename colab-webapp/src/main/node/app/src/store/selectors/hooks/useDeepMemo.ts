/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { isEqual } from 'lodash';
import * as React from 'react';

export function useDeepMemo<T>(value: T): T {
  const oldValue = React.useRef<T>(value);
  // if new value is deep different from previous one
  // update the ref
  if (!isEqual(oldValue.current, value)) {
    oldValue.current = value;
  }

  // always return the ref
  return oldValue.current;
}
