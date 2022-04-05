/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faNewspaper, faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faGhost, faTools } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { lightIconButtonStyle, space_S, textSmall } from '../styling/style';
import Checkbox from './Form/Checkbox';

export type TipsType = 'TODO' | 'NEWS' | 'TIPS' | 'WIP';

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
  WIP: {
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
    case 'WIP':
      return faGhost;
    case 'TIPS':
    default:
      return faQuestionCircle;
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
      <div>
        <Checkbox
          label="Display Todo"
          value={config.TODO.value}
          onChange={config.TODO.set}
          containerClassName={css({ display: 'inline-block', marginRight: space_S })}
        />
        <Tips tipsType="TODO">
          <h4>Todo Example</h4> We know what to do, but we do not do
        </Tips>
      </div>
      <div>
        <Checkbox
          label="Display Tips"
          value={config.TIPS.value}
          onChange={config.TIPS.set}
          containerClassName={css({ display: 'inline-block', marginRight: space_S })}
        />
        <Tips tipsType="TIPS">
          <h4>Tips Example</h4>Some useful info to help users
        </Tips>
      </div>
      <div>
        <Checkbox
          label="Display News"
          value={config.NEWS.value}
          onChange={config.NEWS.set}
          containerClassName={css({ display: 'inline-block', marginRight: space_S })}
        />
        <Tips tipsType="NEWS">
          <h4>News Example</h4>Some new feature to emphasis.
        </Tips>
      </div>
      <div>
        <Checkbox
          label="Display Work in progress elements"
          value={config.WIP.value}
          onChange={config.WIP.set}
          containerClassName={css({ display: 'inline-block', marginRight: space_S })}
        />
        <Tips tipsType="WIP">
          <h4>WIP Example</h4>Some features not completely finished yet.
        </Tips>
      </div>
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
        <FontAwesomeIcon icon={getIconProp(tipsType)} />
        {coord && displayed ? <div className={overlayStyle(coord)}>{children} </div> : null}
      </span>
    );
  } else {
    return <></>;
  }
}

export function WIPContainer({ children }: TipsProps): JSX.Element {
  const config = React.useContext(TipsCtx);
  if (config['WIP'].value) {
    return (
      <>
        <p className={cx(textSmall, lightIconButtonStyle)}>
          --- Work in progress feature below ---
        </p>
        {children}
      </>
    );
  } else {
    return <></>;
  }
}
