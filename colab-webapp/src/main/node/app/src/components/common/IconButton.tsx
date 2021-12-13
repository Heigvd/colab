/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx, css } from '@emotion/css';
import { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { iconButton, iconStyle, linkStyle, space_S } from '../styling/style';
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
      <FontAwesomeIcon icon={icon} color={iconColor} size={iconSize} className={reverseOrder ? css({marginLeft: space_S}) : css({marginRight: space_S})}/>
      {!reverseOrder ? children : null}
    </Clickable>
  );
}
