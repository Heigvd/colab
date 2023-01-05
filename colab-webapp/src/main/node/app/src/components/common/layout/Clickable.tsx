/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { linkStyle } from '../../styling/style';

export interface ClickableProps {
  onClick?: (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void;
  onDoubleClick?: (
    e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>,
  ) => void;
  enterKeyBehaviour?: 'CLICK' | 'DBL_CLICK' | 'NONE';
  clickable?: boolean;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  clickableClassName?: string;
  ref?: React.RefObject<HTMLSpanElement>;
  stopPropagation?: boolean;
}

export default function Clickable({
  onClick,
  onDoubleClick,
  enterKeyBehaviour = 'CLICK',
  clickable,
  title,
  children,
  className = '',
  clickableClassName = linkStyle,
  ref,
  stopPropagation,
}: ClickableProps): JSX.Element {
  /**
   * Pressing space simulates click.<br/>
   * Pressing enter simulates click or double click
   */
  const keyDownCb = React.useCallback(
    (event: React.KeyboardEvent<HTMLSpanElement>) => {
      if (stopPropagation) {
        event.stopPropagation();
      }
      if (event.code === 'Space') {
        if (onClick != null) {
          onClick(event);
        }
      } else if (event.key === 'Enter') {
        if (enterKeyBehaviour === 'CLICK') {
          if (onClick != null) {
            onClick(event);
          }
        } else if (enterKeyBehaviour === 'DBL_CLICK') {
          if (onDoubleClick != null) {
            onDoubleClick(event);
          }
        }
      }
    },
    [onClick, onDoubleClick, enterKeyBehaviour, stopPropagation],
  );

  const onClickCb = React.useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (stopPropagation) {
        e.stopPropagation();
      }
      if (onClick != null) {
        onClick(e);
      }
    },
    [onClick, stopPropagation],
  );

  const onDoubleClickCb = React.useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (stopPropagation) {
        e.stopPropagation();
      }
      if (onDoubleClick != null) {
        onDoubleClick(e);
      }
    },
    [onDoubleClick, stopPropagation],
  );

  return (
    <span
      tabIndex={0}
      className={onClick != null || clickable ? clickableClassName : className}
      onClick={onClickCb}
      onDoubleClick={onDoubleClickCb}
      onKeyDown={keyDownCb}
      title={title}
      ref={ref}
    >
      {children}
    </span>
  );
}
