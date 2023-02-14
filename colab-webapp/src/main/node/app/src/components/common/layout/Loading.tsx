/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import * as React from 'react';
import InlineLoading from '../element/InlineLoading';

export default function Loading(): JSX.Element {
  return (
    <div>
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
