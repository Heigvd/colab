/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { css, cx } from '@emotion/css';
import { semiDarkMode } from '../styling/style';
import FitSpace from './FitSpace';

interface Props {
  children: JSX.Element;
  toolbar?: React.ReactNode;
  toolbarPosition?:
    | 'TOP_LEFT'
    | 'TOP_RIGHT'
    | 'BOTTOM_LEFT'
    | 'BOTTOM_RIGHT'
    | 'LEFT_TOP'
    | 'LEFT_BOTTOM'
    | 'RIGHT_TOP'
    | 'RIGHT_BOTTOM';
  offsetX?: string;
  offsetY?: string;
}

const cssPos = (
  pos: Props['toolbarPosition'],
  deltaX: string,
  deltaY: string,
): {
  orientation: 'column' | 'row';
  pos: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
} => {
  switch (pos) {
    case 'TOP_LEFT':
      return {
        orientation: 'row',
        pos: {
          bottom: `calc(100% + ${deltaY})`,
          left: `calc(0px - ${deltaX})`,
        },
      };
    case 'TOP_RIGHT':
      return {
        orientation: 'row',
        pos: {
          bottom: `calc(100% + ${deltaY})`,
          right: `calc(0px - ${deltaX})`,
        },
      };
    case 'BOTTOM_LEFT':
      return {
        orientation: 'row',
        pos: {
          top: `calc(100% + ${deltaY})`,
          left: `calc(0px - ${deltaX})`,
        },
      };
    case undefined:
    case 'BOTTOM_RIGHT':
      return {
        orientation: 'row',
        pos: {
          top: `calc(100% + ${deltaY})`,
          right: `calc(0px - ${deltaX})`,
        },
      };
    case 'LEFT_TOP':
      return {
        orientation: 'column',
        pos: {
          top: `calc(0px - ${deltaY})`,
          right: `calc(100% + ${deltaX})`,
        },
      };
    case 'LEFT_BOTTOM':
      return {
        orientation: 'column',
        pos: {
          bottom: `calc(0px - ${deltaY})`,
          right: `calc(100% + ${deltaX})`,
        },
      };
    case 'RIGHT_TOP':
      return {
        orientation: 'column',
        pos: {
          top: `calc(0px - ${deltaY})`,
          left: `calc(100% + ${deltaX})`,
        },
      };
    case 'RIGHT_BOTTOM':
      return {
        orientation: 'column',
        pos: {
          bottom: `calc(0px - ${deltaY})`,
          left: `calc(100% + ${deltaX})`,
        },
      };
  }
};

const hoverStyle = css({
  boxShadow: '0 0 6px 0px grey',
});

export default function WithToolbar({
  children,
  toolbar,
  toolbarPosition = 'BOTTOM_RIGHT',
  offsetX = '0px',
  offsetY = '0px',
}: Props): JSX.Element {
  const cssPosition = cssPos(toolbarPosition, offsetX, offsetY);

  const [hoverToolbar, setHoverToolbar] = React.useState(false);

  return (
    <div
      className={cx(
        hoverToolbar ? hoverStyle : undefined,
        css({
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          ':hover > .toolbar': {
            display: 'flex',
          },
        }),
      )}
    >
      {toolbar ? (
        <div
          onMouseEnter={() => {
            setHoverToolbar(true);
          }}
          onMouseLeave={() => {
            setHoverToolbar(false);
          }}
          className={cx(
            'toolbar',
            semiDarkMode,
            css({
              zIndex: 99,
              display: 'none',
              flexDirection: cssPosition.orientation,
              position: 'absolute',
              padding: '5px',
              borderRadius: '5px',
              ...cssPosition.pos,
            }),
          )}
        >
          {toolbar}
        </div>
      ) : null}
      <FitSpace>{children}</FitSpace>
    </div>
  );
}
