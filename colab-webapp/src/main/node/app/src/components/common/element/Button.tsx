/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
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
  icon?: IconProp;
  iconColor?: string;
  iconSize?: SizeProp;
  reverseOrder?: boolean;
  invertedButton?: boolean;
}

export default function Button({
  title,
  icon,
  iconColor,
  iconSize,
  reverseOrder,
  clickable,
  onClick,
  children,
  invertedButton,
  className,
}: ButtonProps): JSX.Element {
  return (
    <Clickable
      title={title}
      clickable={clickable}
      onClick={onClick}
      className={cx(invertedButton ? inactiveInvertedButtonStyle : inactiveButtonStyle, className)}
      clickableClassName={cx(invertedButton ? invertedButtonStyle : buttonStyle, className)}
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
