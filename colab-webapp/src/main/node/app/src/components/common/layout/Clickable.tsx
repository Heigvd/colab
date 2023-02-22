/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { buttonStyle } from '../../styling/style';

export interface ClickableProps {
  onClick?: (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void;
  onDoubleClick?: (
    e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>,
  ) => void;
  enterKeyBehaviour?: 'CLICK' | 'DBL_CLICK' | 'NONE';
  disabled?: boolean;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  ref?: React.RefObject<HTMLButtonElement>;
  stopPropagation?: boolean;
}

export default function Clickable({
  onClick,
  onDoubleClick,
  enterKeyBehaviour = 'CLICK',
  disabled,
  title,
  children,
  className = buttonStyle,
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
      /* if (event.code === 'Space') {
        if (onClick != null) {
          onClick(event);
        }
      } else  */
      if (event.key === 'Enter') {
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
    <button
      tabIndex={0}
      className={className}
      onClick={onClickCb}
      onDoubleClick={onDoubleClickCb}
      onKeyDown={keyDownCb}
      title={title}
      ref={ref}
      disabled={disabled || onClick === null}
    >
      {children}
    </button>
  );
}
