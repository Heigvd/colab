/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { linkStyle } from '../styling/style';

export interface ClickablenProps {
  onClick?: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  clickableClassName?: string;
}

export default ({
  onClick,
  title,
  children,
  className = '',
  clickableClassName = linkStyle,
}: ClickablenProps): JSX.Element => {
  /**
   * Pressing enter or space simulates click
   */
  const keyDownCb = React.useCallback(
    (event: React.KeyboardEvent<HTMLSpanElement>) => {
      if (onClick != null) {
        if (event.code === 'Space' || event.key === 'Enter') {
          onClick();
        }
      }
    },
    [onClick],
  );

  const onClickCb = React.useCallback(() => {
    if (onClick != null) {
      onClick();
    }
  }, [onClick]);

  return (
    <span
      tabIndex={0}
      className={onClick != null ? clickableClassName : className}
      onClick={onClickCb}
      onKeyDown={keyDownCb}
      title={title}
    >
      {children}
    </span>
  );
};
