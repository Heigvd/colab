/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { checkUnreachable } from '../../../helper';
import useTranslations from '../../../i18n/I18nContext';
import { space_sm } from '../../styling/style';
import Icon from '../layout/Icon';
import Checkbox from './Checkbox';
import { overlayStyle } from './Tooltip';

export type TipsType = 'TODO' | 'NEWS' | 'TIPS' | 'WIP' | 'DEBUG' | 'FEATURE_PREVIEW';

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
  FEATURE_PREVIEW: {
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
  iconClassName?: string;
}

function getIconProp(tipsType: TipsProps['tipsType']): string {
  switch (tipsType) {
    case 'TODO':
      return 'construction';
    case 'NEWS':
      return 'newspaper';
    case 'WIP':
      return 'engineering';
    case 'DEBUG':
      return 'build';
    case 'FEATURE_PREVIEW':
      return 'new_releases';
    case 'TIPS':
    case undefined:
      return 'help';
    default:
      checkUnreachable(tipsType);
      return 'bug_report';
  }
}

function getStyle(t: TipsProps['interactionType']) {
  if (t === 'CLICK') {
    return css({ cursor: 'pointer' });
  } else {
    return css({ cursor: 'help' });
  }
}

const iconStyle = css({ padding: space_sm });

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
          className={css({ display: 'inline-block', marginRight: space_sm })}
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
          className={css({ display: 'inline-block', marginRight: space_sm })}
        />
        <Tips tipsType="NEWS">
          <h4>{i18n.tips.example.news.title}</h4>
          {i18n.tips.example.news.content}
        </Tips>
      </div>
      <div>
        <Checkbox
          label={i18n.tips.label.feature_preview}
          value={config.FEATURE_PREVIEW.value}
          onChange={config.FEATURE_PREVIEW.set}
          className={css({ display: 'inline-block', marginRight: space_sm })}
        />
        <Tips tipsType="FEATURE_PREVIEW">
          <h4>{i18n.tips.example.feature_preview.title}</h4>
          {i18n.tips.example.feature_preview.content}
        </Tips>
      </div>
      <div>
        <Checkbox
          label={i18n.tips.label.wip}
          value={config.WIP.value}
          onChange={config.WIP.set}
          className={css({ display: 'inline-block', marginRight: space_sm })}
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
          className={css({ display: 'inline-block', marginRight: space_sm })}
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
          className={css({ display: 'inline-block', marginRight: space_sm })}
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
  iconClassName,
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
        <Icon icon={getIconProp(tipsType)} className={iconClassName} />
        {coord && displayed && <div className={overlayStyle(coord)}>{children}</div>}
      </span>
    );
  } else {
    return <></>;
  }
}

export function FeaturePreview({ children }: TipsProps): JSX.Element {
  const config = React.useContext(TipsCtx);

  if (config['FEATURE_PREVIEW'].value) {
    return <>{children}</>;
  } else {
    return <></>;
  }
}

export function WIPContainer({ children }: TipsProps): JSX.Element {
  const config = React.useContext(TipsCtx);

  if (config['WIP'].value) {
    return (
      <span className={css({ display: 'contents', '& > *': { boxShadow: '0 0 20px 2px yellow' } })}>
        {/*<p className={cx(textSmall, lightIconButtonStyle)}>--- {i18n.tips.info.wip} ---</p>*/}
        {children}
      </span>
    );
  } else {
    return <></>;
  }
}
