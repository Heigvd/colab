/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import {
  buttonStyle,
  inactiveButtonStyle,
  inactiveInvertedButtonStyle,
  invertedButtonStyle,
  space_S,
} from '../../styling/style';
import Clickable, { ClickableProps } from '../layout/Clickable';

export interface ButtonProps extends Omit<ClickableProps, 'clickableClassName'> {
  invertedButton?: boolean;
  icon?: IconProp;
  iconSize?: SizeProp;
  reverseOrder?: boolean;
  iconColor?: string;
}

export default function Button({
  onClick,
  clickable,
  children,
  title,
  className,
  invertedButton,
  icon,
  iconColor,
  iconSize,
  reverseOrder,
}: ButtonProps): JSX.Element {
  return (
    <Clickable
      onClick={onClick}
      title={title}
      className={cx(invertedButton ? inactiveInvertedButtonStyle : inactiveButtonStyle, className)}
      clickableClassName={cx(invertedButton ? invertedButtonStyle : buttonStyle, className)}
      clickable={clickable}
    >
      {reverseOrder && children}
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          color={iconColor}
          size={iconSize}
          className={reverseOrder ? css({ marginLeft: space_S }) : css({ marginRight: space_S })}
        />
      )}
      {!reverseOrder && children}
    </Clickable>
  );
}
