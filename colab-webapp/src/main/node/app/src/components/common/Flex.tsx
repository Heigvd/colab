/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, CSSObject, cx } from '@emotion/css';
import * as React from 'react';

export interface FlexProps {
  theRef?: React.Ref<HTMLDivElement>;
  direction?: 'row' | 'column';
  className?: string;
  title?: string;
  onClick?: () => void;
  shrink?: CSSObject['flexShrink'];
  grow?: CSSObject['flexGrow'];
  basis?: CSSObject['flexBasis'];
  overflow?: 'clip' | 'auto' | 'visible' | 'scroll' | 'unset' | 'hidden';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justify?:
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'left'
    | 'right'
    | 'normal'
    | 'space-between'
    | 'space-evenly'
    | 'stretch';
  align?:
    | 'center'
    | 'stretch'
    | 'flex-start'
    | 'flex-end'
    | 'self-start'
    | 'self-end'
    | 'normal'
    | 'first'
    | 'first baseline'
    | 'last baseline';
  children: React.ReactNode;
}

export default function Flex({
  theRef,
  children,
  onClick,
  overflow,
  className,
  title,
  wrap,
  shrink,
  grow,
  basis,
  direction = 'row',
  justify = 'normal',
  align = 'flex-start',
}: FlexProps): JSX.Element {
  return (
    <div
      ref={theRef}
      onClick={onClick}
      className={cx(
        css({
          display: 'flex',
          flexDirection: direction,
          [direction === 'column' ? 'overflowY' : 'overflowX']: overflow,
          justifyContent: justify,
          alignItems: align,
          flexShrink: shrink,
          flexGrow: grow,
          flexBasis: basis,
          flexWrap: wrap,
        }),
        className,
      )}
      title={title}
    >
      {children}
    </div>
  );
}

//export default React.forwardRef<HTMLDivElement, FlexProps>(function Flex(
//  {
//    children,
//    onClick,
//    overflow,
//    className,
//    wrap,
//    shrink,
//    grow,
//    direction = 'row',
//    justify = 'normal',
//    align = 'normal',
//  },
//  ref,
//) {
//  return (
//    <div
//      ref={ref}
//      onClick={onClick}
//      className={cx(
//        css({
//          display: 'flex',
//          flexDirection: direction,
//          [direction === 'column' ? 'overflowY' : 'overflowX']: overflow,
//          justifyContent: justify,
//          alignItems: align,
//          flexShrink: shrink,
//          flexGrow: grow,
//          flexWrap: wrap,
//        }),
//        className,
//      )}
//    >
//      {children}
//    </div>
//  );
//});
