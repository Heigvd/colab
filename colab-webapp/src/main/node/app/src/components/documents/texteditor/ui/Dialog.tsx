/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { ReactNode } from 'react';

const dialogActionsStyle = css({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'right',
  marginTop: '20px',
});

const dialogButtonsListStyle = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'right',
  marginTop: '20px',
});

type Props = Readonly<{
  'data-test-id'?: string;
  children: ReactNode;
}>;

export function DialogButtonsList({ children }: Props): JSX.Element {
  return <div className={dialogButtonsListStyle}>{children}</div>;
}

export function DialogActions({ 'data-test-id': dataTestId, children }: Props): JSX.Element {
  return (
    <div className={dialogActionsStyle} data-test-id={dataTestId}>
      {children}
    </div>
  );
}
