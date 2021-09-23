/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import * as React from 'react';
import { fullPageOverlayStyle } from '../styling/style';

interface Props {
  children: React.ReactNode;
}

export default function Overlay({ children }: Props): JSX.Element {
  return (
    <div className={cx(fullPageOverlayStyle, css({ zIndex: 999 }))}>
      <div
        className={css({
          margin: 'auto',
        })}
      >
        {children}
      </div>
    </div>
  );
}
