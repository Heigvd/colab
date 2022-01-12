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
import { iconButton, linkStyle, space_S } from '../styling/style';
import Clickable from './Clickable';

export interface IconButtonProps {
  icon: IconProp;
  iconSize?: SizeProp;
  reverseOrder?: boolean;
  iconColor?: string;
  onClick?: (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void;
  clickable?: boolean;
  title: string;
  className?: string;
}

export default function IconButton({
  onClick,
  icon,
  title,
  className,
  reverseOrder,
  iconColor,
  iconSize,
}: IconButtonProps): JSX.Element {
  return (
    <Clickable
      onClick={onClick}
      title={title}
      className={className}
      clickableClassName={cx(linkStyle, iconButton, className)}
    >
      <FontAwesomeIcon icon={icon} color={iconColor} size={iconSize} className={reverseOrder ? css({marginLeft: space_S}) : css({marginRight: space_S})}/>
    </Clickable>
  );
}
