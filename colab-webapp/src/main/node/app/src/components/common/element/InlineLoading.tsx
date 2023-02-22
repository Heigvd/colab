/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, keyframes } from '@emotion/css';
import * as React from 'react';

const spinning = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(360deg)',
  },
});

const animationDimensions = '40px';
const shapesDimensions = '20px';
interface InlineLoadingProps {
  size?: string;
  maxWidth?: string;
  margin?: string;
  //colour?: boolean;
}

export default function InlineLoading({
  //size = '24px',
  //maxWidth = '',
  margin = '',
}: //colour = false,
InlineLoadingProps): JSX.Element {
  //const EffectivePicto = colour ? Picto : PictoBw;
  return (
    <div
      className={css({
        display: 'inline-block',
        margin: margin,
      })}
    >
      <div
        className={css({
          width: '100px',
          height: '100px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        })}
      >
        <div
          className={css({
            width: animationDimensions,
            height: animationDimensions,
            position: 'relative',
            animation: `${spinning} 2s infinite`,
            '.shape': {
              position: 'absolute',
              borderRadius: shapesDimensions,
              width: shapesDimensions,
              height: shapesDimensions,
            },
            '.shape1': {
              left: 0,
              backgroundColor: 'var(--primary-main)',
            },
            '.shape2': {
              right: 0,
              backgroundColor: 'var(--primary-fade)',
            },
            '.shape3': {
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--primary-dark)',
            },
          })}
        >
          <div className="shape shape1"></div>
          <div className="shape shape2"></div>
          <div className="shape shape3"></div>
        </div>
      </div>
      {/* <EffectivePicto
        className={cx(
          spinningStyle,
          css({
            width: size,
            height: size,
            maxWidth: maxWidth,
          }),
        )}
      /> */}
    </div>
  );
}
