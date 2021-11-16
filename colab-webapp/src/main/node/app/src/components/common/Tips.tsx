/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCircle, faLightbulb, faNewspaper } from '@fortawesome/free-regular-svg-icons';
import { faTools } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import Checkbox from './Form/Checkbox';

export type TipsType = 'TODO' | 'NEWS' | 'TIPS';

export type TipsConfig = Record<TipsType, boolean>;
export type TipsContextType = Record<
  TipsType,
  { value: boolean; set: (newValue: boolean) => void }
>;

export const TipsCtx = React.createContext<TipsContextType>({
  TODO: {
    value: false,
    set: () => {},
  },
  TIPS: {
    value: false,
    set: () => {},
  },
  NEWS: {
    value: false,
    set: () => {},
  },
});

interface TipsProps {
  tipsType?: TipsType;
  interactionType?: 'CLICK' | 'HOVER';
  children?: React.ReactNode;
}

function getIconProp(tipsType: TipsProps['tipsType']): IconProp {
  switch (tipsType) {
    case 'TODO':
      return faTools;
    case 'NEWS':
      return faNewspaper;
    case 'TIPS':
    default:
      return faLightbulb;
  }
}

function getStyle(t: TipsProps['interactionType']) {
  if (t === 'CLICK') {
    return css({ cursor: 'pointer' });
  } else {
    return css({ cursor: 'help' });
  }
}

const ttWidth = 200;
const ttPadding = 10;

const fullWidth = ttWidth + 2 * ttPadding;

function overlayStyle(coord: [number, number]) {
  const x = window.innerWidth < coord[0] + fullWidth ? window.innerWidth - fullWidth - 5 : coord[0];
  return css({
    position: 'fixed',
    left: x,
    top: coord[1],
    padding: `${ttPadding}px`,
    border: '1px solid ',
    backgroundColor: 'var(--bgColor)',
    width: `${ttWidth}px`,
    zIndex: 1,
  });
}

export function TipsSettings(): JSX.Element {
  const config = React.useContext(TipsCtx);

  return (
    <div>
      <Checkbox label="Display Todo" value={config.TODO.value} onChange={config.TODO.set} />
      <Tips tipsType="TODO">
        <h4>Todo Example</h4> We know what to do, but we do not do
      </Tips>
      <Checkbox label="Display Tips" value={config.TIPS.value} onChange={config.TIPS.set} />
      <Tips tipsType="TIPS">
        <h4>Tips Example</h4>Some useful info to help users
      </Tips>
      <Checkbox label="Display News" value={config.NEWS.value} onChange={config.NEWS.set} />
      <Tips tipsType="NEWS">
        <h4>News Example</h4>Some new feature to emphasis.
      </Tips>
    </div>
  );
}

export default function Tips({
  tipsType = 'TIPS',
  children,
  interactionType = 'HOVER',
}: TipsProps): JSX.Element {
  const [coord, setCoord] = React.useState<[number, number] | undefined>(undefined);

  const [displayed, setDisplayed] = React.useState(false);

  const timerRef = React.useRef<number>();
  const config = React.useContext(TipsCtx);

  const onClickCb = React.useMemo(() => {
    if (interactionType === 'CLICK') {
      return (event: React.MouseEvent<HTMLSpanElement>) => {
        setDisplayed(d => !d);
        setCoord(c => {
          if (c != null) {
            return undefined;
          } else {
            return [event.clientX, event.clientY];
          }
        });
      };
    } else {
      return undefined;
    }
  }, [interactionType]);

  const onMoveCb = React.useMemo(() => {
    if (!displayed && interactionType === 'HOVER') {
      return (event: React.MouseEvent<HTMLSpanElement>) => {
        setCoord([event.clientX, event.clientY]);
      };
    } else {
      return undefined;
    }
  }, [interactionType, displayed]);

  const onEnterCb = React.useMemo(() => {
    if (interactionType === 'HOVER') {
      return () => {
        if (timerRef.current == null) {
          timerRef.current = window.setTimeout(() => {
            setDisplayed(true);
          }, 750);
        }
      };
    } else {
      return undefined;
    }
  }, [interactionType]);

  const onLeaveCb = React.useMemo(() => {
    if (interactionType === 'HOVER') {
      return () => {
        if (timerRef.current != null) {
          window.clearTimeout(timerRef.current);
          timerRef.current = undefined;
        }
        setCoord(undefined);
        setDisplayed(false);
      };
    } else {
      return undefined;
    }
  }, [interactionType]);

  if (config[tipsType].value) {
    return (
      <span
        className={getStyle(interactionType)}
        onMouseLeave={onLeaveCb}
        onMouseEnter={onEnterCb}
        onMouseMove={onMoveCb}
        onClick={onClickCb}
      >
        <span className="fa-layers fa-fw fa-2x">
          <FontAwesomeIcon icon={faCircle} />
          <FontAwesomeIcon icon={getIconProp(tipsType)} transform="shrink-8" />
        </span>
        {coord && displayed ? <div className={overlayStyle(coord)}>{children} </div> : null}
      </span>
    );
  } else {
    return <></>;
  }
}
