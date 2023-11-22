/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, keyframes } from '@emotion/css';
import * as React from 'react';
import Flex from '../layout/Flex';

const animationHeight = '37px';
const animationWidth = '40px';
const shapesDimensions = '25px';
const shapesDimensionsEnd = '10px';
const spinning = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(360deg)',
  },
});

const sizing = keyframes({
  '0%': {
    width: shapesDimensions,
    height: shapesDimensions,
  },
  '50%': {
    width: shapesDimensionsEnd,
    height: shapesDimensionsEnd,
  },
  '100%': {
    width: shapesDimensions,
    height: shapesDimensions,
  },
});

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
    <Flex
      grow={1}
      align="center"
      justify="center"
      className={css({
        margin: margin,
        alignSelf: 'stretch',
        justifySelf: 'stretch',
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
            width: animationWidth,
            height: animationHeight,
            position: 'relative',
            animation: `ease-in-out ${spinning} 2.5s infinite`,
            '.shape': {
              position: 'absolute',
              borderRadius: shapesDimensions,
              animation: `ease-in-out ${sizing} 2.5s infinite`,
            },
            '.shape1': {
              left: 0,
              backgroundColor: 'var(--primary-100)',
              opacity: 0.8,
            },
            '.shape2': {
              right: 0,
              backgroundColor: 'var(--primary-300)',
              opacity: 0.8,
            },
            '.shape3': {
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--primary-500)',
              opacity: 0.7,
            },
          })}
        >
          <div className="shape shape3"></div>
          <div className="shape shape1"></div>
          <div className="shape shape2"></div>
        </div>
      </div>
    </Flex>
  );
}
