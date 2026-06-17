/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { Circle, ColorResult } from "@uiw/react-color";

interface ColorPickerProps {
  colors: string[];
  onChange: (color: ColorResult) => void;
  color?: string | null | undefined;
  className?: string;
}

export function ColorPicker({
  colors,
  onChange,
  color,
  className,
}: ColorPickerProps): JSX.Element {
  return (
    <Circle
      colors={colors}
      onChange={onChange}
      color={color || undefined}
      className={cx(
        css({
          'div[title="#FFFFFF"]': {
            background: '#FFFFFF !important',
            boxShadow:
              (color || '#FFFFFF').toUpperCase() === '#FFFFFF'
                ? 'rgba(0, 0, 0, 0.5) 0px 0px 0px 2px inset !important'
                : 'rgba(0, 0, 0, 0.1) 0px 0px 6px 3px !important',
          },
        }),
        className,
      )}
    />
  );
}
