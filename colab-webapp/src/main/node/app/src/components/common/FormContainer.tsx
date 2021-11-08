/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { fullPageStyle, invertedThemeMode } from '../styling/style';
import Logo from '../styling/WhiteLogo';

interface Props {
  children: React.ReactNode;
}

export default function ({ children }: Props): JSX.Element {
  return (
    <div className={fullPageStyle}>
      <div
        className={cx(
          css({
            margin: 'auto',
          }),
        )}
      >
        <div
          className={cx(
            invertedThemeMode,
            css({
              display: 'flex',
              alignItems: 'center',
            }),
          )}
        >
          <Logo
            className={css({
              height: '110px',
              width: '200px',
              padding: '10px',
            })}
          />
        </div>
        <div
          className={css({
            textAlign: 'center',
            padding: '10px',
          })}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
