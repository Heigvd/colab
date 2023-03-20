/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { MaterialIconsType } from '../../styling/IconType';

export enum IconSize {
  xs = '20',
  sm = '24',
  md = '40',
  lg = '48',
}
const materialBaseStyle = css({
  fontFamily: 'Material Symbols Outlined',
  fontWeight: 'normal',
  fontStyle: 'normal',
  fontSize: '24px' /* Preferred icon size */,
  display: 'inline-block',
  lineHeight: 1,
  textTransform: 'none',
  letterSpacing: 'normal',
  wordWrap: 'normal',
  whiteSpace: 'nowrap',
  direction: 'ltr',
});

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: MaterialIconsType;
  fill?: boolean;
  wght?: number;
  opsz?: keyof typeof IconSize;
  color?: string;
  className?: string;
}
export default function Icon(props: IconProps): JSX.Element {
  return (
    <span
      {...props}
      className={cx(
        materialBaseStyle,
        css({
          fontVariationSettings: `'FILL' ${props.fill ? 1 : 0} , 'wght' ${
            props.wght || 300
          }, 'GRAD' 0, 'opsz' ${(props.opsz && IconSize[props.opsz]) || 40}`,
          color: props.color || 'inherit',
          fontSize: props.opsz ? `${IconSize[props.opsz]}px` : undefined,
        }),
        props.className
      )}
    >
      {props.icon}
    </span>
  );
}
