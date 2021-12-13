/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { space_M } from '../styling/style';
import Clickable from './Clickable';

interface Props {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const thumbStyle = css({
  cursor: 'pointer',
  padding: space_M,
});

export default function Thumbnail({ children, onClick, className }: Props): JSX.Element {
  return (
      <Clickable onClick={onClick} clickableClassName={cx(thumbStyle, className)}>
        {children}
      </Clickable>
  );
}
