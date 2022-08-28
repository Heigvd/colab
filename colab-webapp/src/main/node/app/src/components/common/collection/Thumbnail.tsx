/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { space_M } from '../../styling/style';
import Clickable from '../layout/Clickable';

interface ThumbnailProps {
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
  children: React.ReactNode;
  disableOnEnter?: boolean;
}

const thumbStyle = css({
  cursor: 'pointer',
  padding: space_M,
});

export default function Thumbnail({
  onClick,
  onDoubleClick,
  className,
  children,
  disableOnEnter,
}: ThumbnailProps): JSX.Element {
  return (
    <Clickable
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      enterKeyBehaviour={disableOnEnter ? 'NONE' : 'DBL_CLICK'}
      clickableClassName={cx(thumbStyle, className)}
    >
      {children}
    </Clickable>
  );
}
