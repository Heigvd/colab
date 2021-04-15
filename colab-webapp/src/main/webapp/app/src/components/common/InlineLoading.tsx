/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import PictoBw from '../styling/PictoBw';
import Picto from '../styling/Picto';
import { css, cx } from '@emotion/css';
import { pulseEase } from '../styling/style';

interface Props {
  size?: string;
  maxWidth?: string;
  margin?: string;
  colour?: boolean;
}

export default function InlineLoading({
  size = '24px',
  maxWidth = '',
  margin = '',
  colour = false,
}: Props) {
  const EffectivePicto = colour ? Picto : PictoBw;
  return (
    <div
      className={css({
        display: 'inline-block',
        margin: margin,
      })}
    >
      <EffectivePicto
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
