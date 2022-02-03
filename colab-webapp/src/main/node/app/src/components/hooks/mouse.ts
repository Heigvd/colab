/*
 * The coLAB project
 * Copyright (C) 2022 maxence
 *
 * Licensed under the MIT License
 */

import React from 'react';

/**
 * This function is a virtual click/doubleclick handler.
 * It never trigers the simple click if the double is called.
 * @param onClick - Click callback : Executed after delay time if no other click as been sent
 * @param onDoubleClick  - Doubleclick callback
 * @param delay - the time between 2 clicks to determine single or doubleclick
 * @param stopPropagation - call stopPropagation ASAP
 * @param preventDefault - call preventDefault ASAP
 */
export function useSingleAndDoubleClick(
  onClick: React.DOMAttributes<HTMLDivElement>['onClick'],
  onDoubleClick: React.DOMAttributes<HTMLDivElement>['onClick'],
  delay: number = 250,
  stopPropagation = true,
  preventDefault = false,
) {
  const timer = React.useRef<NodeJS.Timeout | null>(null);
  return (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    if (preventDefault) {
      e.preventDefault();
    }
    if (timer.current == null) {
      timer.current = setTimeout(() => {
        timer.current = null;
        if (onClick) {
          onClick(e);
        }
      }, delay);
    } else {
      clearTimeout(timer.current);
      timer.current = null;
      if (onDoubleClick) {
        onDoubleClick(e);
      }
    }
  };
}
