/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import Logo from '../styling/Logo';
import { fullPageStyle } from '../styling/style';

interface PublicEntranceContainerProps {
  children: React.ReactNode;
}

export default function PublicEntranceContainer({
  children,
}: PublicEntranceContainerProps): JSX.Element {
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
