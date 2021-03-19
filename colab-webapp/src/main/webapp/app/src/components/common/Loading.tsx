/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import { css } from '@emotion/css';
import { fullPageStyle } from '../style';
import InlineLoading from './InlineLoading';

export default function Loading() {
  return (
    <div className={fullPageStyle}>
      <div
        className={css({
          margin: 'auto',
        })}
      >
        <InlineLoading size="200px" />
      </div>
    </div>
  );
}
