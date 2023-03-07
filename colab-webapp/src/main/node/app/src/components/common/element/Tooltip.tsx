/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { br_lg, text_regular, text_xs } from '../../styling/style';

const ttWidth = 200;
const ttPadding = 10;

const fullWidth = ttWidth + 2 * ttPadding;

export function overlayStyle(coord: [number, number]) {
  const x = window.innerWidth < coord[0] + fullWidth ? window.innerWidth - fullWidth - 5 : coord[0];
  return cx(
    br_lg,
    text_xs,
    text_regular,
    css({
      position: 'fixed',
      left: x,
      top: coord[1],
      padding: `${ttPadding}px`,
      border: '1px solid var(--divider-main)',
      backgroundColor: 'var(--secondary-darker)',
      color: 'var(--secondary-contrast)',
      width: `max-content`,
      minWidth: '150px',
      maxWidth: '200px',
      zIndex: 10,
      whiteSpace: 'initial',
    }),
  );
}

export interface TooltipProps {
  className?: string;
  tooltip: React.ReactNode | (() => React.ReactNode);
  children?: React.ReactNode;
  delayMs?: number;
  tooltipClassName?: string;
}

export default function Tooltip({
  className,
  children,
  tooltip,
  delayMs = 600,
  tooltipClassName,
}: TooltipProps): JSX.Element {
  const [coord, setCoord] = React.useState<[number, number] | undefined>(undefined);

  const [displayed, setDisplayed] = React.useState(false);

  const timerRef = React.useRef<number>();

  const onMoveCb = React.useMemo(() => {
    if (!displayed) {
      return (event: React.MouseEvent<HTMLSpanElement>) => {
        setCoord([event.clientX, event.clientY]);
      };
    } else {
      return undefined;
    }
  }, [displayed]);

  const onEnterCb = React.useCallback(() => {
    if (timerRef.current == null) {
      timerRef.current = window.setTimeout(() => {
        setDisplayed(true);
      }, delayMs);
    }
  }, [delayMs]);

  const onLeaveCb = React.useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    setCoord(undefined);
    setDisplayed(false);
  }, []);

  return (
    <span
      className={className}
      onMouseLeave={onLeaveCb}
      onMouseEnter={onEnterCb}
      onMouseMove={onMoveCb}
    >
      {children}
      {coord && displayed && (
        <div className={cx(overlayStyle(coord), tooltipClassName)}>
          {tooltip instanceof Function ? tooltip() : tooltip}
        </div>
      )}
    </span>
  );
}
