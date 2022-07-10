/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';

// not used anymore

export interface Props {
  children: JSX.Element;
  direction?: 'row' | 'column';
}

export default function FitSpace({ children, direction = 'column' }: Props): JSX.Element {
  return (
    <div className={css({ flexGrow: 1, display: 'flex', flexDirection: direction })}>
      {children}
    </div>
  );
}
