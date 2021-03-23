/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { css, cx } from '@emotion/css';
import Logo from './Logo';

export interface LogoProps {
  className?: string;
}

export default ({ className }: LogoProps) => {
  return (
    <Logo
      className={cx(
        css({
          '#logo_svg__colabText > path': {
            fill: 'var(--fgColor)',
          },
        }),
        className,
      )}
    />
  );
};

