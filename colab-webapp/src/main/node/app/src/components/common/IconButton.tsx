/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { iconButton, iconStyle, linkStyle } from '../styling/style';
import Clickable, { ClickablenProps } from './Clickable';

export interface IconButtonProps extends Omit<ClickablenProps, "clickableClassName">{
  icon: IconProp;
  iconSize?: SizeProp;
  reverseOrder?: boolean;
  iconColor?: string;
}

export default function IconButton({
  onClick,
  icon,
  title,
  children,
  className,
  reverseOrder,
  iconColor,
  iconSize,
}: IconButtonProps): JSX.Element {
  return (
    <Clickable
      onClick={onClick}
      title={title}
      className={cx(iconStyle, iconButton, className)}
      clickableClassName={cx(linkStyle, className)}
    >
      {reverseOrder ? children : null}
      <FontAwesomeIcon icon={icon} color={iconColor} size={iconSize} />
      {!reverseOrder ? children : null}
    </Clickable>
  );
}
