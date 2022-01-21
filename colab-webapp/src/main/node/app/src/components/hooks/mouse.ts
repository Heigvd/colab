/*
 * The coLAB project
 * Copyright (C) 2022 maxence
 *
 * Licensed under the MIT License
 */

import React, { useEffect, useState } from 'react';

/**
 * Allows to use both onClick and onDoubleClick on the same component.
 */
export function useSingleAndDoubleClick(
  actionSimpleClick: (e: React.MouseEvent) => void,
  actionDoubleClick: (e: React.MouseEvent) => void,
  stopPropag = true,
  delay = 250,
) {
  const [event, setEvent] = useState<React.MouseEvent | undefined>(undefined);

  useEffect(() => {
    if (event) {
      if (event.detail === 1) {
        // on first click, delay the simpleClick callback
        const timer = setTimeout(() => {
          actionSimpleClick(event);
          setEvent(undefined);
        }, delay);

        // clear timer on unmount
        // i.e. if the duration between two clicks and is less than the value of delay
        return () => clearTimeout(timer);
      } else if (event.detail === 2) {
        actionDoubleClick(event);
      }
    }
  }, [event, actionSimpleClick, actionDoubleClick, delay]);

  return React.useCallback(
    (e: React.MouseEvent) => {
      if (stopPropag) {
        // make sure to call stoppropagation in the callback, not in the effect
        e.stopPropagation();
      }
      // setting a new event will clear and rebuild the effect
      setEvent(e);
    },
    [stopPropag],
  );
}
