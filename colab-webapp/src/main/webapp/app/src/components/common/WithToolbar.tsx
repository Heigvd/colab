/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { semiDarkMode } from '../styling/style';
//import FitSpace from './FitSpace';

interface Props {
  children: JSX.Element;
  toolbar?: React.ReactNode;
  toolbarPosition?:
    | 'TOP_LEFT'
    | 'TOP_MIDDLE'
    | 'TOP_RIGHT'
    | 'BOTTOM_LEFT'
    | 'BOTTOM_MIDDLE'
    | 'BOTTOM_RIGHT'
    | 'LEFT_TOP'
    | 'LEFT_MIDDLE'
    | 'LEFT_BOTTOM'
    | 'RIGHT_TOP'
    | 'RIGHT_MIDDLE'
    | 'RIGHT_BOTTOM';
  toolbarClassName?: string;
  // 1 means width of the toolbar
  offsetX?: number;
  // 1 means height of the toolbar
  offsetY?: number;
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
    case 'TOP_MIDDLE':
      return {
        orientation: 'row',
        pos: {
          bottom: `calc(100% + ${deltaY})`,
          left: `calc(50% - ${deltaX})`,
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
    case 'BOTTOM_MIDDLE':
      return {
        orientation: 'row',
        pos: {
          top: `calc(100% + ${deltaY})`,
          left: `calc(50% - ${deltaX})`,
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
    case 'LEFT_MIDDLE':
      return {
        orientation: 'column',
        pos: {
          top: `calc(50% - ${deltaY})`,
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
    case 'RIGHT_MIDDLE':
      return {
        orientation: 'column',
        pos: {
          top: `calc(50% - ${deltaY})`,
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
  toolbarClassName = semiDarkMode,
  offsetX = 0,
  offsetY = 0,
}: Props): JSX.Element {
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  const [offsets, setOffsets] = React.useState({ x: '0px', y: '0px' });

  const cssPosition = cssPos(toolbarPosition, offsets.x, offsets.y);

  const [hoverToolbar, setHoverToolbar] = React.useState(false);

  const hoverTrueCb = React.useCallback(() => {
    setHoverToolbar(true);
  }, []);

  const hoverFalseCb = React.useCallback(() => {
    setHoverToolbar(false);
  }, []);

  const posCb = React.useCallback(() => {
    if (toolbarRef.current != null && toolbarRef.current.offsetParent != null) {
      if (toolbarRef.current != null && toolbarRef.current.offsetParent != null) {
        const newOffsets = {
          x: `${toolbarRef.current.clientWidth * offsetX}px`,
          y: `${toolbarRef.current.clientHeight * offsetY}px`,
        };
        setOffsets(newOffsets);
      }
    }
  }, [offsetX, offsetY, toolbarRef]);

  return (
    <div
      onMouseEnter={posCb}
      className={cx(
        hoverToolbar ? hoverStyle : undefined,
        css({
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: 'max-content',
          position: 'relative',
          ':hover > .toolbar': {
            display: 'flex',
          },
        }),
      )}
    >
      {toolbar ? (
        <div
          ref={toolbarRef}
          onMouseEnter={hoverTrueCb}
          onMouseLeave={hoverFalseCb}
          className={cx(
            'toolbar',
            toolbarClassName,
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
      {children}
    </div>
  );
}
