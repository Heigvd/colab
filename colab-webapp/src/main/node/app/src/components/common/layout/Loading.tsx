/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import * as React from 'react';
import { fullPageStyle } from '../../styling/style';
import InlineLoading from '../element/InlineLoading';

export default function Loading(): JSX.Element {
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
