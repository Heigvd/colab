/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { linkStyle } from '../styling/style';

export interface ClickablenProps {
  onClick?: (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void;
  clickable?: boolean;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  clickableClassName?: string;
}

export default function Clickable({
  onClick,
  clickable,
  title,
  children,
  className = '',
  clickableClassName = linkStyle,
}: ClickablenProps): JSX.Element {
  /**
   * Pressing enter or space simulates click
   */
  const keyDownCb = React.useCallback(
    (event: React.KeyboardEvent<HTMLSpanElement>) => {
      if (onClick != null) {
        if (event.code === 'Space' || event.key === 'Enter') {
          onClick(event);
        }
      }
    },
    [onClick],
  );

  const onClickCb = React.useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (onClick != null) {
        onClick(e);
      }
    },
    [onClick],
  );

  return (
    <span
      tabIndex={0}
      className={onClick != null || clickable ? clickableClassName : className}
      onClick={onClickCb}
      onKeyDown={keyDownCb}
      title={title}
    >
      {children}
    </span>
  );
}
