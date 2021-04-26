/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { iconButton, linkStyle, iconStyle } from '../styling/style';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { cx } from '@emotion/css';

export interface IconButtonProps {
  onClick?: () => void;
  icon: IconProp;
  iconSize?: SizeProp;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  reverseOrder?: boolean;
  iconColor?: string;
}

export default ({
  onClick,
  icon,
  title,
  children,
  className,
  reverseOrder,
  iconColor,
  iconSize,
}: IconButtonProps): JSX.Element => {
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
      className={
        className
          ? cx(onClick != null ? linkStyle : iconStyle, className)
          : onClick != null
          ? linkStyle
          : iconStyle
      }
      onClick={onClickCb}
      onKeyDown={keyDownCb}
      title={title}
    >
      {reverseOrder ? children : null}
      <FontAwesomeIcon icon={icon} color={iconColor} size={iconSize} className={iconButton} />
      {!reverseOrder ? children : null}
    </span>
  );
};
