/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { MaterialIconsType } from '../../../styling/IconType';

export enum IconSize {
  xxs = '16',
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
  theRef?: React.Ref<HTMLSpanElement>;
}
export default function Icon(props: IconProps): JSX.Element {
  const { icon, fill, wght, opsz, color, className, theRef, ...restProps } = props;

  return (
    <span
      {...restProps}
      ref={theRef}
      className={cx(
        materialBaseStyle,
        css({
          fontVariationSettings: `'FILL' ${fill ? 1 : 0} , 'wght' ${
            wght || 300
          }, 'GRAD' 0, 'opsz' ${(opsz && IconSize[opsz]) || 40}`,
          color: color || 'inherit',
          fontSize: opsz ? `${IconSize[opsz]}px` : undefined,
        }),
        className,
      )}
    >
      {icon}
    </span>
  );
}
