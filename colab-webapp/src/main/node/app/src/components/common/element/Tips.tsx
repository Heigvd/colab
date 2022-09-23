/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faNewspaper, faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faGhost, faStethoscope, faTools } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { lightIconButtonStyle, space_S, textSmall } from '../../styling/style';
import Checkbox from './Checkbox';

export type TipsType = 'TODO' | 'NEWS' | 'TIPS' | 'WIP' | 'DEBUG';

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
  DEBUG: {
    value: false,
    set: () => {},
  },
});

export interface TipsProps {
  tipsType?: TipsType;
  interactionType?: 'CLICK' | 'HOVER';
  children?: React.ReactNode;
  className?: string;
}

function getIconProp(tipsType: TipsProps['tipsType']): IconProp {
  switch (tipsType) {
    case 'TODO':
      return faTools;
    case 'NEWS':
      return faNewspaper;
    case 'WIP':
      return faGhost;
    case 'DEBUG':
      return faStethoscope;
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

const iconStyle = css({ padding: space_S });

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
    whiteSpace: 'initial',
  });
}

export function TipsSettings(): JSX.Element {
  const i18n = useTranslations();

  const config = React.useContext(TipsCtx);

  return (
    <div>
      <div>
        <Checkbox
          label={i18n.tips.label.tips}
          value={config.TIPS.value}
          onChange={config.TIPS.set}
          className={css({ display: 'inline-block', marginRight: space_S })}
        />
        <Tips tipsType="TIPS">
          <h4>{i18n.tips.example.tips.title}</h4>
          {i18n.tips.example.tips.content}
        </Tips>
      </div>
      <div>
        <Checkbox
          label={i18n.tips.label.news}
          value={config.NEWS.value}
          onChange={config.NEWS.set}
          className={css({ display: 'inline-block', marginRight: space_S })}
        />
        <Tips tipsType="NEWS">
          <h4>{i18n.tips.example.news.title}</h4>
          {i18n.tips.example.news.content}
        </Tips>
      </div>
      <div>
        <Checkbox
          label={i18n.tips.label.wip}
          value={config.WIP.value}
          onChange={config.WIP.set}
          className={css({ display: 'inline-block', marginRight: space_S })}
        />
        <Tips tipsType="WIP">
          <h4>{i18n.tips.example.wip.title}</h4>
          {i18n.tips.example.wip.content}
        </Tips>
      </div>
      <div>
        <Checkbox
          label={i18n.tips.label.todo}
          value={config.TODO.value}
          onChange={config.TODO.set}
          className={css({ display: 'inline-block', marginRight: space_S })}
        />
        <Tips tipsType="TODO">
          <h4>{i18n.tips.example.todo.title}</h4>
          {i18n.tips.example.todo.content}
        </Tips>
      </div>
      <div>
        <Checkbox
          label={i18n.tips.label.debug}
          value={config.DEBUG.value}
          onChange={config.DEBUG.set}
          className={css({ display: 'inline-block', marginRight: space_S })}
        />
        <Tips tipsType="DEBUG">
          <h4>{i18n.tips.example.debug.title}</h4>
          {i18n.tips.example.debug.content}
        </Tips>
      </div>
    </div>
  );
}

export default function Tips({
  tipsType = 'TIPS',
  interactionType = 'HOVER',
  children,
  className,
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
        className={cx(getStyle(interactionType), iconStyle, className)}
        onMouseLeave={onLeaveCb}
        onMouseEnter={onEnterCb}
        onMouseMove={onMoveCb}
        onClick={onClickCb}
      >
        <FontAwesomeIcon icon={getIconProp(tipsType)} />
        {coord && displayed && <div className={overlayStyle(coord)}>{children}</div>}
      </span>
    );
  } else {
    return <></>;
  }
}

export function WIPContainer({ children }: TipsProps): JSX.Element {
  const i18n = useTranslations();

  const config = React.useContext(TipsCtx);

  if (config['WIP'].value) {
    return (
      <>
        <p className={cx(textSmall, lightIconButtonStyle)}>--- {i18n.tips.info.wip} ---</p>
        {children}
      </>
    );
  } else {
    return <></>;
  }
}
