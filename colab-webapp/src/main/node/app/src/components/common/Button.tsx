/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import * as React from 'react';
import { buttonStyle, inactiveButtonStyle } from '../styling/style';
import Clickable from './Clickable';

export interface ButtonProps {
  onClick?: () => void;
  label: string | ReactJSXElement;
  title: string;
  className?: string;
}

export default function Button({ onClick, label, title, className }: ButtonProps): JSX.Element {
  return (
    <Clickable
      onClick={onClick}
      title={title}
      className={cx(inactiveButtonStyle, className)}
      clickableClassName={cx(buttonStyle, className)}
    >
      {label}
    </Clickable>
  );
}
