/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import * as React from 'react';
import { buttonStyle, inactiveButtonStyle, inactiveInvertedButtonStyle, invertedButtonStyle } from '../styling/style';
import Clickable from './Clickable';

export interface ButtonProps {
  onClick?: () => void;
  clickable?: boolean;
  label: string | ReactJSXElement;
  title: string;
  className?: string;
  invertedButton?: boolean;
}

export default function Button({ onClick, clickable, label, title, className, invertedButton }: ButtonProps): JSX.Element {
  return (
    <Clickable
      onClick={onClick}
      title={title}
      className={cx(invertedButton ? inactiveInvertedButtonStyle : inactiveButtonStyle, className)}
      clickableClassName={cx(invertedButton ? invertedButtonStyle : buttonStyle, className)}
      clickable={clickable}
    >
      {label}
    </Clickable>
  );
}
