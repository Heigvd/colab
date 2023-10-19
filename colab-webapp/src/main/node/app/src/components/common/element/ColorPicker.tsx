/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { CirclePicker, ColorChangeHandler } from 'react-color';

interface ColorPickerProps {
  colors: string[];
  onChange: ColorChangeHandler;
  color?: string | null | undefined;
  width?: 'auto';
  className?: string;
}

export function ColorPicker({ colors, onChange, color, width, className }: ColorPickerProps): JSX.Element {
  return (
    <CirclePicker
      colors={colors}
      onChangeComplete={onChange}
      color={color || undefined}
      width={width}
      className={cx(css({
        'div[title="#FFFFFF"]': {
          background: '#FFFFFF !important',
          boxShadow:
            (color || '#FFFFFF').toUpperCase() === '#FFFFFF'
              ? 'rgba(0, 0, 0, 0.5) 0px 0px 0px 2px inset !important'
              : 'rgba(0, 0, 0, 0.1) 0px 0px 6px 3px !important',
        },
      }), className)}
    />
  );
}
