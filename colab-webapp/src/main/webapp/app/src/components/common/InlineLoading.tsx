/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import Picto from '../styling/PictoBw';
import { css, cx } from '@emotion/css';
import { pulseEase } from '../styling/style';

interface Props {
  size?: string;
  maxWidth?: string;
  margin?: string;
}

export default function InlineLoading({ size = '24px', maxWidth = '', margin = '' }: Props) {
  return (
    <div
      className={css({
        margin: margin,
      })}
    >
      <Picto
        className={cx(
          pulseEase,
          css({
            width: size,
            height: size,
            maxWidth: maxWidth,
          }),
        )}
      />
    </div>
  );
}
