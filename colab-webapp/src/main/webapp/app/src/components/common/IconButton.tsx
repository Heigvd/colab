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
import Clickable from './Clickable';

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
      className={cx(iconStyle, className)}
      clickableClassName={cx(linkStyle, className)}
    >
      {reverseOrder ? children : null}
      <FontAwesomeIcon icon={icon} color={iconColor} size={iconSize} className={iconButton} />
      {!reverseOrder ? children : null}
    </Clickable>
  );
}
