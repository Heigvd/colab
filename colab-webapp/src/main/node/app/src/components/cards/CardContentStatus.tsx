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
import Badge from '../common/element/Badge';
import Flex from '../common/layout/Flex';
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
      return { icon: 'close', color: 'var(--error-main)' };
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
        opsz='xs'
      />
    );
  } else if (mode === 'semi') {
    if (status === 'ACTIVE') {
      return <></>;
    }
    return (
      // Maybe improve theming of Badge comp for more colors?
      <Badge
        variant="outline"
        title={tooltip}
        icon={getStatusIconAndColor(status).icon}
        className={cx(badgeStyle(getStatusIconAndColor(status).color), className)}
      >
        {i18n.modules.card.settings.statuses[status]}
      </Badge>
    );
  } else {
    return (
      <Flex align='center'
      >
        {status != 'ACTIVE' && <Icon icon= {getStatusIconAndColor(status).icon} opsz='xs' /> }
        {i18n.modules.card.settings.statuses[status]}
      </Flex>
    );
  }
}
