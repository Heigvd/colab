/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import Logo from '../../images/picto_bw.svg';
import { css, cx } from '@emotion/css';
import { pulseEase } from '../style';

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
      <Logo
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
