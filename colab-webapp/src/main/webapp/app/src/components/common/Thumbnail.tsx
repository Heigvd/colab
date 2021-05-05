/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';

import { css, cx } from '@emotion/css';
import Clickable from './Clickable';

interface Props {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const thumbStyle = css({
  cursor: 'pointer',
  margin: '20px',
  padding: '10px',
  width: 'max-content',
  border: '1px solid grey',
});

export default ({ children, onClick, className }: Props): JSX.Element => {
  return (
    <div className={cx(thumbStyle, className)}>
      <Clickable onClick={onClick}>{children}</Clickable>
    </div>
  );
};
