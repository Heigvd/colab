/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx, keyframes } from '@emotion/css';
import * as React from 'react';
import Picto from '../../styling/Picto';
import PictoBw from '../../styling/PictoBw';

const spinning = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(360deg)',
  },
});

export const spinningStyle = css({
  animation: `${spinning} 1s linear 0s infinite`,
});


interface InlineLoadingProps {
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
}: InlineLoadingProps): JSX.Element {
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
          spinningStyle,
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
