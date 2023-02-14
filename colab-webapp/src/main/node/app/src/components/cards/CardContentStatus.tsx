/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { CardContentStatus } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import Icon from '../common/layout/Icon';
import { space_sm } from '../styling/style';

const badgeStyle = (color: string) => {
  return css({
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${color}`,
    color: `${color}`,
    margin: '0 2px',
    padding: '3px',
    fontSize: '0.8em',
    textTransform: 'uppercase',
    gap: space_sm,
  });
};

export interface CardContentStatusProps {
  status: CardContentStatus;
  mode: 'icon' | 'semi' | 'full';
  className?: string;
}
type StatusIconAndColorType = {
  icon: string;
  color: string;
};

export function getStatusIconAndColor(status: CardContentStatus): StatusIconAndColorType {
  switch (status) {
    case 'ACTIVE':
      return { icon: 'edit', color: 'var(--success-main)' };
    case 'PREPARATION':
      return { icon: 'edit', color: '#B54BB2' };
    case 'VALIDATED':
      return { icon: 'check', color: 'var(--success-main)' };
    case 'POSTPONED':
      return { icon: 'pause', color: 'orange' };
    case 'ARCHIVED':
      return { icon: 'inventory_2', color: '#9C9C9C' };
    case 'REJECTED':
      return { icon: 'close', color: 'var(--error-main)'};
  }
}

export default function CardContentStatusDisplay({
  status,
  mode,
  className,
}: CardContentStatusProps): JSX.Element {
  const i18n = useTranslations();

  const tooltip = i18n.modules.card.settings.statusTooltip(status);

  if (mode === 'icon') {
    if (status === 'ACTIVE') {
      return <></>;
    }
    return (
       <Icon
        className={cx(css({ paddingRight: space_sm }), className)}
        icon={getStatusIconAndColor(status).icon}
        color={getStatusIconAndColor(status).color}
        title={tooltip}
      />
    );
  } else if (mode === 'semi') {
    if (status === 'ACTIVE') {
      return <></>;
    }
    return (
      <div className={cx(badgeStyle(getStatusIconAndColor(status).color), className)}>
         <Icon icon={getStatusIconAndColor(status).icon} opsz={'sm'} title={tooltip} />
        {i18n.modules.card.settings.statuses[status]}
      </div>
    );
  } else {
    return (
      <div title={tooltip}>
        {status != 'ACTIVE' && (
           <Icon
            className={css({ paddingRight: space_sm })}
            icon={getStatusIconAndColor(status).icon}
            color={getStatusIconAndColor(status).color}
          />
        )}
        <span>{i18n.modules.card.settings.statuses[status]}</span>
      </div>
    );
  }
}
