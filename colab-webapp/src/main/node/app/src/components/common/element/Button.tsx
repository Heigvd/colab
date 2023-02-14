/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import {
  buttonStyle,
  inactiveButtonStyle,
  inactiveInvertedButtonStyle,
  invertedButtonStyle,
  space_sm,
} from '../../styling/style';
import Clickable, { ClickableProps } from '../layout/Clickable';
import Icon, { IconSize } from '../layout/Icon';

export interface ButtonProps extends Omit<ClickableProps, 'clickableClassName'> {
  icon?: string;
  iconColor?: string;
  iconSize?: keyof typeof IconSize;
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
         <Icon
          icon={icon}
          color={iconColor}
          opsz={iconSize}
          className={reverseOrder ? css({ marginLeft: space_sm }) : css({ marginRight: space_sm })}
        />
      )}
      {!reverseOrder && children}
    </Clickable>
  );
}
